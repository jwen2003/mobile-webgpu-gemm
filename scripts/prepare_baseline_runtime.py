"""Stage the unmodified pinned npm package locally; no npm install/build needed."""
import base64
import hashlib
import io
import json
import pathlib
import tarfile
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
VERSION = '0.10.29'
INTEGRITY = 'sha512-PRznwHOprGNoSbTbtAyHkMD1rslPLEBSidvz/Ga7qWVr86CXmPEcQpFCidLciBpWNKF8VhQMU2YA51YyBCbPKg=='
URL = f'https://registry.npmjs.org/@mediapipe/tasks-genai/-/tasks-genai-{VERSION}.tgz'
FILES = ['genai_bundle.mjs', 'genai.d.ts', 'package.json', 'README.md'] + [
    f'wasm/genai_wasm{variant}_internal.{extension}'
    for variant in ['', '_nosimd', '_module'] for extension in ['js', 'wasm']
]


def main():
    cache = ROOT / '.cache' / 'baseline' / f'tasks-genai-{VERSION}.tgz'
    if not cache.exists():
        cache.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(URL, timeout=120) as response:
            data = response.read()
    else:
        data = cache.read_bytes()
    actual = 'sha512-' + base64.b64encode(hashlib.sha512(data).digest()).decode()
    if actual != INTEGRITY:
        raise ValueError('Package integrity mismatch; no runtime files staged')
    cache.write_bytes(data)
    destination = ROOT / 'assets' / 'vendor' / 'tasks-genai' / VERSION
    files = []
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as archive:
        package = json.loads(archive.extractfile('package/package.json').read())
        if package['name'] != '@mediapipe/tasks-genai' or package['version'] != VERSION:
            raise ValueError('Unexpected npm package identity')
        # Extract only explicit files; never extract archive paths wholesale.
        for name in FILES:
            member = archive.getmember('package/' + name)
            if not member.isfile():
                raise ValueError('Unexpected archive member type')
            content = archive.extractfile(member).read()
            path = destination / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(content)
            files.append({'path': name, 'bytes': len(content), 'sha256': hashlib.sha256(content).hexdigest()})
    manifest = {'package': package['name'], 'version': VERSION, 'source': URL,
                'npmIntegrity': INTEGRITY, 'license': package['license'],
                'localRoot': f'/assets/vendor/tasks-genai/{VERSION}',
                'modified': False, 'files': files}
    (ROOT / 'src' / 'baseline' / 'runtime_manifest.json').write_text(
        json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(f'Staged {len(files)} original files from @mediapipe/tasks-genai@{VERSION}; integrity verified.')


if __name__ == '__main__':
    main()
