#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/.."

export KERAS_HOME="$DIR/.keras"
export MPLCONFIGDIR="$DIR/.matplotlib"
export TF_CPP_MIN_LOG_LEVEL=2

if [ -f "$DIR/venv/bin/python" ]; then
    PYTHON_BIN="$DIR/venv/bin/python"
else
    PYTHON_BIN="python3"
fi

echo "🌱 Starting Smart Farm Disease Detection API on http://localhost:8000..."
exec "$PYTHON_BIN" "$DIR/main.py"

