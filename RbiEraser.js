// ----------------------------------------------------------------------------
// PixInsight JavaScript Runtime API - PJSR Version 1.0
// ----------------------------------------------------------------------------
// BatchRbiEraser.js - Released 2023/09/09 16:24:26 UTC
// ----------------------------------------------------------------------------
//
// This file is part of BatchRbiEraser Script version 0.1.0
//
// Copyright (c) 2023 Hugues Obolonsky - HoxCa
//
// Based on BatchFormatConversion.js
// Copyright (c) 2009-2013 Pleiades Astrophoto S.L.
// Written by Juan Conejero (PTeam)
//
// Redistribution and use in both source and binary forms, with or without
// modification, is permitted provided that the following conditions are met:
//
// 1. All redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//
// 2. All redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// 3. Neither the names "PixInsight" and "Pleiades Astrophoto", nor the names
//    of their contributors, may be used to endorse or promote products derived
//    from this software without specific prior written permission. For written
//    permission, please contact info@pixinsight.com.
//
// 4. All products derived from this software, in any form whatsoever, must
//    reproduce the following acknowledgment in the end-user documentation
//    and/or other materials provided with the product:
//
//    "This product is based on software from the PixInsight project, developed
//    by Pleiades Astrophoto and its contributors (http://pixinsight.com/)."
//
//    Alternatively, if that is where third-party acknowledgments normally
//    appear, this acknowledgment must be reproduced in the product itself.
//
// THIS SOFTWARE IS PROVIDED BY PLEIADES ASTROPHOTO AND ITS CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
// TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL PLEIADES ASTROPHOTO OR ITS
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, BUSINESS
// INTERRUPTION; PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; AND LOSS OF USE,
// DATA OR PROFITS) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.
// ----------------------------------------------------------------------------

/*
 * BatchRbiEraser v0.1.0
 *
 * A batch to anihilate residual bulk image artifact from lights frames.
 *
 * This script allows you to define a set of input lights frames, an image
 * of the residual bulk image artefact to process, a mask of the bulk image
 * aera, an optional output directory, and output file and sample formats.
 * The script then iterates reading each input light frame, applying linear fits
 * to the residual bulk image for this light frame and then perform a division
 * of this synthetic flat to the light frame before saving the corrected frame
 * to the output directory with the specified output file format.
 *
 * Copyright (C) 2023 Hugues Obolonsky - HoxCa
 */

#feature-id    BatchRbiEraser : Batch Processing > BatchRbiEraser

#feature-info  A batch residual bulk image eraser utility.<br/>\
   <br/> \
   This script allows you to define a set of input lights frames, an image \
   of the residual bulk image artefact to process, a mask of the bulk image \
   aera, an optional output directory, and output file and sample formats.\
   <br>\
   <br>\
   The script then iterates reading each input light frame, applying linear fits \
   to the residual bulk image for this light frame and then perform a division \
   of this synthetic flat to the light frame before saving the corrected frame \
   to the output directory with the specified output file format.\
   <br>\
   Copyright &copy; 2023 Hugues Obolonsky - HoxCa.

#feature-icon  BatchRbiEraser.xpm

#include <pjsr/ColorSpace.jsh>
#include <pjsr/FrameStyle.jsh>
#include <pjsr/Sizer.jsh>
#include <pjsr/SampleType.jsh>
#include <pjsr/StdButton.jsh>
#include <pjsr/StdIcon.jsh>
#include <pjsr/TextAlign.jsh>
#include <pjsr/UndoFlag.jsh>

#define DEFAULT_OUTPUT_EXTENSION ".xisf"
#define WARN_ON_NO_OUTPUT_DIRECTORY 0

#define VERSION "0.1.0"
#define TITLE   "BatchRbiEraser"

#include "lib/gui_interface.js"
#include "lib/linearfit.js"
#include "lib/pixelmath_utils.js"
#include "lib/stf.js"
#include "lib/fileutils.js"

/*
 * Batch Format Conversion engine
 */

function uniqueViewIdNoLeadingZero(baseId) {
   var id = baseId;
   for (var i = 1; !View.viewById(id).isNull; ++i) {
      id = baseId + format("%d", i);
   }
   return id;
}

/*
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
*/

function ResidualBulkImageEraserEngine()
{

   this.inputFiles = new Array;
   this.residualBulkImageName = "";
   this.rbiMaskImageName = "";
   this.residualBulkImageWindow = null;
   this.outputDirectory = "";
   this.outputPrefix = "";
   this.outputPostfix = "_x";
   this.outputExtension = DEFAULT_OUTPUT_EXTENSION;
   this.overwriteExisting = false;
   this.outputFormat = null;
   this.showImages = true;
   var frameImageWindow = null;


   this.loadRbiImage = function() {
      try
      {
         this.residualBulkImageWindow = fileutils.readImage(this.residualBulkImageName);
         this.residualBulkImageView = this.residualBulkImageWindow.mainView;
      }
      catch ( error )
      {
         console.writeln( error.message );
         console.writeln( error.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
            .split('\n'));

         (new MessageBox( error.message + " Continue?", TITLE, StdIcon_Error, StdButton_Yes, StdButton_No )).execute();
      }
   };
   this.freeRbiImage = function() {
      try
      {
         this.residualBulkImageView = null;
         if ( this.residualBulkImageWindow != null )
         {
            this.residualBulkImageWindow.purge();
            this.residualBulkImageWindow.close();
         }
         this.residualBulkImageWindow  = null;
      }
      catch ( error )
      {
         (new MessageBox( error.message, TITLE, StdIcon_Error, StdButton_Yes, StdButton_No )).execute();
      }
   };

   this.loadRbiMask = function() {
      try
      {
         this.rbiMaskImageWindow = fileutils.readImage(this.rbiMaskImageName);
         this.rbiMaskImageView = this.rbiMaskImageWindow.mainView;
      }
      catch ( error )
      {
         console.writeln( error.message );
         console.writeln( error.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
            .split('\n'));

         (new MessageBox( error.message + " Continue?", TITLE, StdIcon_Error, StdButton_Yes, StdButton_No )).execute();
      }
   };

   this.freeRbiMask = function() {
      try
      {
         this.rbiMaskImageView = null;
         if ( this.rbiMaskImageWindow != null )
         {
            this.rbiMaskImageWindow.purge();
            this.rbiMaskImageWindow.forceClose();
         }
         this.rbiMaskImageWindow  = null;
      }
      catch ( error )
      {
         (new MessageBox( error.message, TITLE, StdIcon_Error, StdButton_Yes, StdButton_No )).execute();
      }
   };

   this.processingRBI = function() {

   try {
      this.loadRbiImage();
      if (this.residualBulkImageView == null)
      {
         throw new Error("Unable to read the rbi artifact file, cannot continue.");
      }
      this.residualBulkImage = this.residualBulkImageView.image;

      this.loadRbiMask();
      if (this.rbiMaskImageView == null)
      {
         throw new Error("Unable to read the rbi mask file, cannot continue.");
      }

      // apply convolution to mask
      this.rbiMaskImageView.beginProcess( UndoFlag_NoSwapFile );
      applyConvolution(this.rbiMaskImageView);
      this.rbiMaskImageView.endProcess();

      this.residualBulkImageWindowClone = new ImageWindow(
         this.residualBulkImage.width,
         this.residualBulkImage.height,
         this.residualBulkImage.numberOfChannels,
         32,
         true,
         this.residualBulkImage.colorSpace != ColorSpace_Gray,
         uniqueViewIdNoLeadingZero("clone")
         );
      this.residualBulkImageWindowCloneView = this.residualBulkImageWindowClone.mainView;

      // loop thru lightframes
      var succeeded = 0;
      var errored = 0;

      for ( var i = 0; i < this.inputFiles.length; ++i ) {
        try {

          frameImageWindow = fileutils.readImage(this.inputFiles[i])
          var frameImageView = frameImageWindow.mainView;
          if (this.showImages) {
            frameImageWindow.show();
            STFAutoStretch(frameImageView);
          }

          // apply linearisation to bulk image
          this.residualBulkImageWindowCloneView.beginProcess( UndoFlag_NoSwapFile );
          this.residualBulkImageWindowCloneView.image.assign( this.residualBulkImage );
          applyLinearFit(frameImageView,this.residualBulkImageWindowCloneView);
          this.residualBulkImageWindowCloneView.endProcess();

          // mask lightframe and apply a flat division
          console.noteln("Apply flat division to lightframe: "+frameImageView.id);
          frameImageWindow.maskVisible = false;
          frameImageWindow.mask = this.rbiMaskImageWindow;
          frameImageWindow.maskEnabled = true;
          frameImageView.beginProcess( UndoFlag_NoSwapFile );
          applyFlatDivision(frameImageView,this.residualBulkImageWindowCloneView);
          frameImageView.endProcess();

          // Save lightframe
          fileutils.writeImage(frameImageWindow,this.inputFiles[i])

          // Close lightframe
          frameImageWindow.maskEnabled = false;
          frameImageWindow.purge();
          frameImageWindow.close();
          frameImageWindow = null;

          // Revert the bulk image linearisation
          this.residualBulkImageWindowCloneView.historyIndex = this.residualBulkImageWindowCloneView.historyIndex - 1;
          gc();
          ++succeeded;
        }
        catch ( error )
        {
          ++errored;
          if (frameImageWindow != null) {
            frameImageWindow.maskEnabled = false;
            frameImageWindow.purge();
            frameImageWindow.close();
            frameImageWindow = null;
          }
          if ( i+1 == this.inputFiles.length )
            throw error;
            var errorMessage = "<p>" + error.message + ":</p>" +
                               "<p>" + this.inputFiles[i] + "</p>" +
                               "<p><b>Continue batch residual bulk image eraser ?</b></p>";
           if ( (new MessageBox( errorMessage, TITLE, StdIcon_Error, StdButton_Yes, StdButton_No )).execute() != StdButton_Yes )
            break;
         }
      }
      // end loop
      console.writeln( format( "<end><cbr><br>===== %d succeeded, %u error%s, %u skipped =====",
                       succeeded, errored, (errored == 1) ? "" : "s", this.inputFiles.length-succeeded-errored ) );

      this.residualBulkImageWindowClone.show();
      // this.rbiMaskImageWindow.show();
   }
   catch ( error ) {
     (new MessageBox( error.message, TITLE, StdIcon_Error, StdButton_Yes, StdButton_No )).execute();
   }
   finally {
     if (frameImageWindow != null) {
            frameImageWindow.maskEnabled = false;
            frameImageWindow.purge();
            frameImageWindow.close();
            frameImageWindow = null;
     }

     if(this.residualBulkImageWindowClone != null) {
       this.residualBulkImageWindowClone.maskEnabled = false;
       this.residualBulkImageWindowClone.purge();
       this.residualBulkImageWindowClone.close();
       this.residualBulkImageWindowClone = null
     }

     this.freeRbiMask();
     this.freeRbiImage();

   }
   // end RBI function
   };

}

var rbiEraser = new ResidualBulkImageEraserEngine;

// Our dialog inherits all properties and methods from the core Dialog object.
BatchRbiEraserDialog.prototype = new Dialog;

/*
 * Script entry point.
 */
function main()
{
   console.hide();

   // Show our dialog box, quit if cancelled.
   var dialog = new BatchRbiEraserDialog();
   for ( ;; )
   {
      if ( dialog.execute() )
      {
         if ( rbiEraser.inputFiles.length == 0 )
         {
            (new MessageBox( "No input files have been specified!", TITLE, StdIcon_Error, StdButton_Ok )).execute();
            continue;
         }

#ifneq WARN_ON_NO_OUTPUT_DIRECTORY 0
         if ( rbiEraser.outputDirectory.length == 0 )
            if ( (new MessageBox( "<p>No output directory has been specified.</p>" +
                                  "<p>Each image will be written to the directory of " +
                                  "its corresponding input file.<br>" +
                                  "<b>Are you sure?</b></p>",
                                  TITLE, StdIcon_Warning, StdButton_Yes, StdButton_No )).execute() != StdButton_Yes )
               continue;
#endif
         // Perform batch file format conversion and quit.
         console.show();
         console.abortEnabled = true;
         rbiEraser.processingRBI();

         if ( (new MessageBox( "Do you want to perform another residual bulk image erase ?",
                               TITLE, StdIcon_Question, StdButton_Yes, StdButton_No )).execute() == StdButton_Yes )
            continue;
      }

      break;
   }
}

main();

// ----------------------------------------------------------------------------
// EOF BatchRbiEraser.js - Released 2023/09/09 16:24:26 UTC
