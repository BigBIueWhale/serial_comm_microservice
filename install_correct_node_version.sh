#!/bin/bash

# Function to display an error message and exit
exit_with_error() {
    echo "Error: $1"
    exit 1
}

# Parse command-line arguments
TARGET_HOME_DIR=""
for i in "$@"
do
case $i in
    --home)
    HOME_FLAG=1
    ;;
    *)
    if [ "${HOME_FLAG}" == "1" ]; then
        TARGET_HOME_DIR="$i"
        HOME_FLAG=0
    fi
    ;;
esac
done

echo "TARGET_HOME_DIR: ${TARGET_HOME_DIR}"

# Validate TARGET_HOME_DIR
if [ -z "${TARGET_HOME_DIR}" ]; then
    exit_with_error "Home directory not specified. Usage: \"sudo ./install_correct_node_version.sh --home /home/user\""
fi

# Step 1: Uninstall existing Node.js and npm
echo "Removing existing Node.js and npm installations..."
sudo apt-get remove --purge nodejs npm -y || exit_with_error "Failed to remove existing Node.js and npm."
sudo apt-get autoremove -y || exit_with_error "Failed to autoremove packages."
sudo rm -rf /etc/apt/sources.list.d/nodesource.list
sudo rm -rf /usr/lib/node_modules
sudo rm -rf ${TARGET_HOME_DIR}/.npm
sudo rm -rf ${TARGET_HOME_DIR}/.nvm
sudo rm -rf ${TARGET_HOME_DIR}/.node-gyp
sudo apt-get update || exit_with_error "Failed to update package lists."

# Step 2: Install curl if not already installed
if ! command -v curl &> /dev/null; then
    echo "Installing curl..."
    sudo apt-get install curl -y || exit_with_error "Failed to install curl."
fi

# Step 3: Install NVM
if [ ! -d "${TARGET_HOME_DIR}/.nvm" ]; then
    echo "Creating NVM directory..."
    mkdir -p "${TARGET_HOME_DIR}/.nvm" || exit_with_error "Failed to create NVM directory."

    echo "Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | NVM_DIR="${TARGET_HOME_DIR}/.nvm" bash || exit_with_error "Failed to install NVM."

    # Define NVM source lines
    NVM_SOURCE_LINE1="export NVM_DIR=\"${TARGET_HOME_DIR}/.nvm\""
    NVM_SOURCE_LINE2="[ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\""

    # Check if NVM source lines already exist in .bashrc and append if not
    if ! grep -q "${NVM_SOURCE_LINE1}" "${TARGET_HOME_DIR}/.bashrc"; then
        echo "Appending NVM environment setup to ${TARGET_HOME_DIR}/.bashrc"
        echo "${NVM_SOURCE_LINE1}" >> "${TARGET_HOME_DIR}/.bashrc"
        echo "${NVM_SOURCE_LINE2}" >> "${TARGET_HOME_DIR}/.bashrc"
        echo "NVM environment setup appended to ensure NVM is sourced on shell startup."
    else
        echo "NVM environment setup already exists in ${TARGET_HOME_DIR}/.bashrc"
    fi
fi

# Source NVM in the script
export NVM_DIR="${TARGET_HOME_DIR}/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" || exit_with_error "Failed to source NVM."

# Step 4: Install the desired version of Node.js
nvm install 20.11.0 || exit_with_error "Failed to install Node.js 20.11.0."

# Step 5: Use the installed version
nvm use 20.11.0 || exit_with_error "Failed to use Node.js 20.11.0."

# Step 6: Check the installed version
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo "Now restart the terminal to use npm commands"
