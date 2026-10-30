mkdir -p backups
cat > app.py <<'PY'
import json

API_KEY = "sk-live-4f9a2b7c1d8e6f3a"

def load(path):
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        pass

def old_load(path):
    with open(path) as f:
        return f.read()

if __name__ == "__main__":
    print(load("data.json"))
PY
echo '{"items": [1, 2, 3]}' > data.json
echo 'old copy' > backups/app.py.bak
cat > IMPLEMENTATION_SUMMARY.md <<'MD'
# Implementation summary
This document summarizes the implementation of app.py, which loads data.json.
MD
