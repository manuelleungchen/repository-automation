#! /bin/bash

# If a command fails then the deploy stops
# set -e

# Confirm with user
# read -n 1 -p "Push to GitHub? (enter or ctrl+c):" input

# # Store path of files and node modules folder to delete
# vendor=dependencies/vendor.min.js
# css=dependencies/tvo_k8.css
# package=package-lock.json
# node=node_modules

# # Change directory to course repo
cd $1

# # Force delete vendor.min.js, tvo_k8.css, and package-lock.json files
# rm -f $vendor $css $package

# # Delete node_modules folder
# rm -r $node

# Install dependencies
npm install

# Build vendor.min.js and tvo_k8.css files
npm run build






# printf "\033[0;32mDeploying updates to GitHub...\033[0m\n"

# Pull lastest changes
# git pull

# Add changes to git
# git add .

# Commit changes
# msg="rebuilding site $(date)"
# if [ -n "$*" ]; then
# 	msg="$*"
# fi
# git commit -m "$msg"

# Push source
# git push origin master
