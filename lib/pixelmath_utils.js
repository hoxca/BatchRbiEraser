function applyFlatDivision(targetView,imageSupportView) {
   var RBI = imageSupportView.id
   var pixelMathExpression = "$T*mean("+RBI+")/"+RBI;
   this.applyPixelMath(targetView,pixelMathExpression)
}

function applyConvolution(targetView) {
   var pixelMathExpression = "gconv($T,7)";
   this.applyPixelMath(targetView,pixelMathExpression)
}

this.applyPixelMath = function(targetView,pixelMathExpression) {
  var pixelMath = new PixelMath;
  with(pixelMath) {
    expression = pixelMathExpression;
    expression1 = "";
    expression2 = "";
    expression3 = "";
    useSingleExpression = true;
    symbols = "";
    clearImageCacheAndExit = false;
    cacheGeneratedImages = false;
    generateOutput = true;
    singleThreaded = false;
    optimization = true;
    use64BitWorkingImage = false;
    rescale = false;
    rescaleLower = 0;
    rescaleUpper = 1;
    truncate = true;
    truncateLower = 0;
    truncateUpper = 1;
    createNewImage = false;
    showNewImage = true;
    newImageId = "RBI_ONLY";
    newImageWidth = 0;
    newImageHeight = 0;
    newImageAlpha = false;
    newImageColorSpace = PixelMath.prototype.SameAsTarget;
    newImageSampleFormat = PixelMath.prototype.SameAsTarget;

    executeOn(targetView);
  }
}

