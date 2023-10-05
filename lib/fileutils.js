function fileutils(filePath,imageWindow) {

   this.readImage = function(filePath)
   {
      var inputImageWindow = ImageWindow.open(filePath);

      return inputImageWindow[0];
   };

   this.writeImage = function(imageWindow,filePath)
   {

      var fileDir = (rbiEraser.outputDirectory.length > 0) ? rbiEraser.outputDirectory :
                    File.extractDrive( filePath ) + File.extractDirectory( filePath );
      if ( !fileDir.endsWith( '/' ) )
         fileDir += '/';
      var fileName = File.extractName( filePath );
      var outputFilePath = fileDir + rbiEraser.outputPrefix + fileName + rbiEraser.outputPostfix + rbiEraser.outputExtension;

      console.writeln("<end><cbr><br>Output file:");

      if ( File.exists(outputFilePath) )
      {
         if ( rbiEraser.overwriteExisting )
         {
            console.writeln( "<end><cbr>** Overwriting existing file: " + outputFilePath );
         }
         else
         {
            console.writeln( "<end><cbr>* File already exists: " + outputFilePath );
            for ( var u = 1; ; ++u )
            {
               var tryFilePath = File.appendToName(outputFilePath, '_' + u.toString());
               if ( !File.exists(tryFilePath) )
               {
                  outputFilePath = tryFilePath;
                  break;
               }
            }
            console.writeln( "<end><cbr>* Writing to: <raw>" + outputFilePath + "</raw>" );
         }
      }
      else
      {
         console.writeln( "<raw>" + outputFilePath + "</raw>" );
      }

      // write the output image to disk using
      // Boolean ImageWindow.saveAs(
      //    String filePath[,
      //    Boolean queryOptions[,
      //    Boolean allowMessages[,
      //    Boolean strict[,
      //    Boolean verifyOverwrite]]]] )
      imageWindow.saveAs( outputFilePath, false, false, false, false );
      // this statement will force ImageWindow to disable all format and security features, as follows
      //    disable query format-specific options
      //    disable warning messages on missing format features (icc profiles, etc)
      //    disable strict image writing mode (ignore lossy image generation)
      //    disable overwrite verification/protection
   };
}

var fileutils = new fileutils;
