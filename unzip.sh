#!/bin/bash

# Get the directory of the script itself
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Define the path to the zip file relative to the script's location
ZIP_FILE="$SCRIPT_DIR/precompiled/protobuf_compiler/protoc-25.2-linux-x86_64.zip"

# Check if the zip file exists
if [ -f "$ZIP_FILE" ]; then
    # Unzip into a new folder
    unzip -o "$ZIP_FILE" -d "$SCRIPT_DIR/precompiled/protobuf_compiler/protoc-25.2"
else
    echo "Zip file not found: $ZIP_FILE"
    exit 1
fi
