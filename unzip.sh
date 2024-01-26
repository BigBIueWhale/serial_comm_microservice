#!/bin/bash

# Get the directory of the script itself
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Define a bash associative array (dictionary) for platform to zip file mapping
declare -A PLATFORM_ZIP_MAP=(
    ["linux-aarch_64"]="protoc-25.2-linux-aarch_64.zip"
    ["linux-ppcle_64"]="protoc-25.2-linux-ppcle_64.zip"
    ["linux-s390_64"]="protoc-25.2-linux-s390_64.zip"
    ["linux-x86_32"]="protoc-25.2-linux-x86_32.zip"
    ["linux-x86_64"]="protoc-25.2-linux-x86_64.zip"
    ["osx-aarch_64"]="protoc-25.2-osx-aarch_64.zip"
    ["osx-universal_binary"]="protoc-25.2-osx-universal_binary.zip"
    ["osx-x86_64"]="protoc-25.2-osx-x86_64.zip"
)

# Function to display usage and exit
usage() {
    echo "Usage: $0 --platform <platform>"
    echo "Available platforms:"
    for key in "${!PLATFORM_ZIP_MAP[@]}"; do
        echo "  - $key"
    done
    exit 1
}

# Parse the command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --platform) platform="$2"; shift ;;
        *) usage ;;
    esac
    shift
done

# Validate the platform argument
if [[ -z "${PLATFORM_ZIP_MAP[$platform]}" ]]; then
    echo "Error: Invalid or missing platform specified."
    usage
fi

# Define the path to the zip file relative to the script's location
ZIP_FILE="$SCRIPT_DIR/precompiled/protobuf_compiler/${PLATFORM_ZIP_MAP[$platform]}"

# Delete the existing protoc-25.2 folder
rm -rf "$SCRIPT_DIR/precompiled/protobuf_compiler/protoc-25.2"

# Check if the zip file exists
if [ -f "$ZIP_FILE" ]; then
    # Unzip into a new folder
    unzip -o "$ZIP_FILE" -d "$SCRIPT_DIR/precompiled/protobuf_compiler/protoc-25.2"
else
    echo "Zip file not found: $ZIP_FILE"
    exit 1
fi
