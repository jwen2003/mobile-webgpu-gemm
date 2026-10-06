"""Owned temporary loopback-only CDP tunnel; always removed; metadata only."""
import json, subprocess, shutil
from pathlib import Path

def metadata(adb, serial, output, roles_only=True):
    port=None;result=None;cleanup={}
    def run(args):return subprocess.run(args,capture_output=True,text=True,timeout=180)
    try:
        create=run([adb,'-s',serial,'forward','tcp:0','localabstract:chrome_devtools_remote'])
        if create.returncode:raise RuntimeError('adb forward failed: '+create.stderr)
        port=int(create.stdout.strip())
        script=f"@(Get-NetTCPConnection -LocalPort {port} -State Listen -ErrorAction Stop).LocalAddress | ConvertTo-Json -Compress"
        check=run(['powershell','-NoProfile','-Command',script])
        addresses=json.loads(check.stdout.strip());addresses=[addresses] if isinstance(addresses,str) else addresses
        if check.returncode or not addresses or any(a!='127.0.0.1' for a in addresses):raise RuntimeError('Listener is not exclusively 127.0.0.1')
        node=shutil.which('node')
        if node is None:
            bundled=Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
            if bundled.is_file():node=str(bundled)
        if node is None:raise RuntimeError('Node.js unavailable; install/provide Node or use configured Codex bundled runtime; no roles collected')
        call=run([node,str(Path(__file__).with_name('memory002_metadata.cjs')),str(port),str(output)]+(['--roles-only'] if roles_only else []))
        if call.returncode:raise RuntimeError('Metadata helper failed: '+call.stderr)
        result=json.loads(Path(output).read_text(encoding='utf-8'));return result
    finally:
        if port is not None:
            remove=run([adb,'-s',serial,'forward','--remove',f'tcp:{port}'])
            forwards=run([adb,'forward','--list'])
            listener=run(['powershell','-NoProfile','-Command',f"[bool](Get-NetTCPConnection -LocalPort {port} -State Listen -ErrorAction SilentlyContinue) | ConvertTo-Json"])
            cleanup={'port':port,'removeExitCode':remove.returncode,'forwardPresent':any(len(line.split())>1 and line.split()[0]==serial and line.split()[1]==f'tcp:{port}' for line in forwards.stdout.splitlines()),'listenerPresent':json.loads(listener.stdout.strip()) if listener.returncode==0 else 'UNKNOWN'}
            Path(str(output)+'.cleanup.json').write_text(json.dumps(cleanup,indent=2)+'\n',encoding='utf-8')
            if cleanup['forwardPresent'] or cleanup['listenerPresent'] is not False:raise RuntimeError('Tunnel cleanup not confirmed')

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser();parser.add_argument('--adb',default=r'C:\Tools\platform-tools\platform-tools\adb.exe');parser.add_argument('--serial',required=True);parser.add_argument('--output',required=True);a=parser.parse_args()
    Path(a.output).parent.mkdir(parents=True,exist_ok=True)
    print(json.dumps(metadata(a.adb,a.serial,a.output),indent=2))
