#! /bin/bash

# Store path of files and node modules folder to delete
vendor=dependencies/vendor.min.js
css=dependencies/tvo_k8.css
package=package-lock.json
node=node_modules

# Change directory to course repo
cd $1

# Force delete vendor.min.js, tvo_k8.css, and package-lock.json files
rm -f $vendor $css $package

# Delete node_modules folder
rm -r $node

