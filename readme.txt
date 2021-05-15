# install main
1.  delete all gulp packange dependences  and reinstall with --save
2.  modify lib/configs/local
3.  delete package depnendences with run error:

# add packages
  packages/about
           ...
           tabs
# gulp
  remove all packages build and rebuild application.js

# update ace editor source
 rename require(". to ace_require(". for avoid browsify error
