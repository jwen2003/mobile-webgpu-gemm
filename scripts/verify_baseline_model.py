"""Hash the exact manually downloaded Web model; never download or request tokens."""
import argparse
import datetime
import hashlib
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
FILENAME = 'gemma-3n-E2B-it-int4-Web.litertlm'
SOURCE = 'https://huggingface.co/google/gemma-3n-E2B-it-litert-lm/blob/main/' + FILENAME


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--expected-sha256', help='Optional publisher SHA256 copied from the exact Web file details')
    args = parser.parse_args()
    path = ROOT / 'assets' / 'models' / FILENAME
    if not path.is_file():
        raise SystemExit(f'Model missing: {path}. Download the exact -Web.litertlm file after authorized access.')
    with path.open('rb') as stream:
        prefix = stream.read(512)
        if path.stat().st_size < 1024 * 1024 or prefix.lstrip().lower().startswith((b'<!doctype', b'<html', b'version https://git-lfs')):
            raise SystemExit('Not a complete model binary (small file, HTML, or Git LFS pointer).')
        stream.seek(0)
        digest = hashlib.file_digest(stream, 'sha256').hexdigest()
    if args.expected_sha256 and digest != args.expected_sha256.lower():
        raise SystemExit('Publisher SHA256 mismatch; metadata not updated.')
    manifest = {'model': 'Gemma 3n E2B instruction-tuned', 'filename': FILENAME,
                'localPath': '/assets/models/' + FILENAME, 'sourcePage': SOURCE,
                'sourceRevision': 'main (download revision not independently recorded)',
                'status': 'LOCAL_FILE_HASHED', 'actualBytes': path.stat().st_size,
                'sha256': digest, 'publisherSha256': args.expected_sha256.lower() if args.expected_sha256 else None,
                'publisherHashMatched': bool(args.expected_sha256),
                'verificationScope': 'Desktop file size and SHA256; exact Web filename; not a browser rehash or runtime compatibility result',
                'verifiedIsoTime': datetime.datetime.now(datetime.timezone.utc).isoformat()}
    (path.parent / 'model_manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(manifest, indent=2))


if __name__ == '__main__':
    main()
