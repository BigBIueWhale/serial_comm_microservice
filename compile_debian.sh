#!/bin/bash

# Get the directory of the script itself
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Define the path to the protobuf compiler executable relative to the script's location
PROTOC="$SCRIPT_DIR/precompiled/protobuf_compiler/protoc-25.2/bin/protoc"

# Export the PROTOC environment variable
export PROTOC

# Run cargo build
cargo build
BUILD_STATUS=$?

# Check if cargo build was successful
if [ $BUILD_STATUS -ne 0 ]; then
    echo "Cargo build failed with status: $BUILD_STATUS"
    exit $BUILD_STATUS
fi

echo "Cargo build completed successfully."
