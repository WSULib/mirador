(function($) {

  /**
   * Default values for settings
   */
  $.DEFAULT_SETTINGS = {

    'workspaceType': 'singleObject',

    'saveSession' : true,  //whether or not to store session to local storage

    'workspaces' : {
      'singleObject': {
        'label': 'Single Object',
        'addNew': false,
        'move': false,
        'iconClass': 'image'
      },
      'compare': {
        'label': 'Compare',
        'iconClass': 'columns'
      },
      'bookReading': {
        'defaultWindowOptions': {
        },
        'label': 'Book Reading',
        'addNew': true,
        'move': false,
        'iconClass': 'book'
      }
    },

    'layout': '1x1',

    'windowObjects' : [
      /** within a single object, the following options:
       *   "loadedManifest": [manifestURI] e.g. "http://dms-data.stanford.edu/data/manifests/Walters/qm670kv1873/manifest.json"
       *   "availableViews" : defaults to ['ThumbnailsView', 'ImageView', 'ScrollView', 'BookView'], any subset removes others
       *   "viewType" : one of ['ThumbnailsView', 'ImageView', 'ScrollView', 'BookView'] - if using availableViews, must be in subset
       *   "canvasID": [canvas URI] e.g. "http://dms-data.stanford.edu/data/manifests/Walters/qm670kv1873/canvas/canvas-12"
       *   "bottomPanel" : [true, false] whether or not to make the bottom panel available/visible in this window
       *   "sidePanel" : [true, false] whether or not to make the side panel available/visible in this window
       *   "overlay" : [true, false] whether or not to make the overlay available/visible in this window
       *   "annotationLayer" : [true, false] whether or not to make annotation layer available in this window
       *   "annotationCreation" : [true, false] whether or not to make annotation creation available in this window, 
       *                          only valid if annotationLayer is set to True and an annotationEndpoint is defined.
       *                          This setting does NOT affect whether or not a user can edit an individual annotation that has already been created.
       *   "annotationOn" : [true, false] whether or not to turn on the annotation layer on window load
       *   "fullScreen" : [true, false] whether or not to make the fullScreen HUD button visible to user
       *   "windowOptions" : [data specific to the view type, such as OSD bounds and zoom level - automatically saved in SaveController]
       *   "id" : [unique window ID - set by application and automatically saved in SaveController]
       *   "displayLayout" : [true, false], whether or not to display all layout options, removing individual menu options is separate
       *   "layoutOptions" : control individual menu items in layout menu. if "displayLayout" is false, these options won't be applied
       *     {
       *     "newObject" : [true, false]
       *     "close" : [true, false]
       *     "slotRight" : [true, false]
       *     "slotLeft" : [true, false]
       *     "slotAbove" : [true, false]
       *     "slotBelow" : [true, false]
       *     }
       **/
    ],

    'defaultWindowSettings': {

    },

    'availableAnnotationModes': [

    ],

    'availableAnnotationDrawingTools': [

    ],
    
    'availableCanvasTools': [

    ],

    // main (top) menu
    //we don't actually take the height into account for the mirador-viewer div, so don't use for now
    'mainMenuSettings': {
      'show': true,
      'buttons' : {
        'bookmark' : true,
        'layout' : true,
        'options' : false
      }
      //'height': 25,
      //'width': '100%'
    },

    'workspacePanelSettings': {
      'maxRows': 5,
      'maxColumns': 5,
      'preserveWindows': true 
    },

    //true or false.  controls display of "Add new object from URL" on manifest listing page
    'showAddFromURLBox' : true,

    'i18nPath' : 'build/mirador/locales/',

    'logosLocation' : 'build/mirador/images/logos/',

    'repoImages' : {
      'other': 'iiif_logo.png'
    },

    /**
     *  Annotation backend that have instance-specific configuration data as a hash, e.g.:
     *  {
     *  name: 'backend name',
     *  module: 'NameEndpoint',
     *  options: 
     *  { 'url': '',
     *    'storeId': 123,
     *    'APIKey': '23983hf98j3f9283jf2983fj'
     *  }
     *  }
     **/
    'annotationEndpoint': {},

    'sharingEndpoint': {
      'url': '',
      'storeId': 123,
      'APIKey': '23983hf98j3f9283jf2983fj'
    },

    // linked image views configuration
    'lockController' : {
      'lockProfile' : 'lazyZoom',
      'notifyMaxMin' : true
    },

    // OpenSeadragon configuration
    'openSeadragon' : {
      'visibilityRatio' : 0.1
    }

  };

}(Mirador));
