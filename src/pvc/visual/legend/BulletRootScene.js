
/**
 * Initializes a legend bullet root scene.
 * 
 * @name pvc.visual.legend.BulletRootScene
 * 
 * @extends pvc.visual.Scene
 * 
 * @constructor
 * @param {pvc.visual.Scene} [parent] The parent scene, if any.
 * @param {object} [keyArgs] Keyword arguments.
 * See {@link pvc.visual.Scene} for supported keyword arguments.
 */
def
.type('pvc.visual.legend.BulletRootScene', pvc.visual.Scene)
.init(function(parent, keyArgs){
    
    this.base(parent, keyArgs);
    
    var markerDiam = def.get(keyArgs, 'markerSize', 15);
    var padding = new pvc.Sides(def.get(keyArgs, 'padding', 5))
                    .resolve(markerDiam, markerDiam);
    def.set(this.vars,
        'horizontal', def.get(keyArgs, 'horizontal', false),
        'font',       def.get(keyArgs, 'font'),
        'markerSize', markerDiam, // Diameter of bullet/marker zone
        'textMargin', def.get(keyArgs, 'textMargin', 6),  // Space between marker and text 
        'padding',    padding);
})
.add(/** @lends pvc.visual.legend.BulletRootScene# */{
    layout: function(layoutInfo){
        // Any size available?
        var clientSize = layoutInfo.clientSize;
        if(!(clientSize.width > 0 && clientSize.height > 0)){
            return new pvc.Size(0,0);
        }
        
        // The size of the biggest cell
        var markerDiam = this.vars.markerSize;
        var textLeft   = markerDiam + this.vars.textMargin;
        var padding    = this.vars.padding;
        
        // Names are for legend items when layed out in rows
        var a_width  = this.vars.horizontal ? 'width' : 'height';
        var a_height = pvc.BasePanel.oppositeLength[a_width]; // height or width
        
        var maxRowWidth = clientSize[a_width]; // row or col
        var row;
        var rows = [];
        var contentSize = {width: 0, height: 0};
        
        this.childNodes.forEach(function(groupScene){
            groupScene.childNodes.forEach(layoutItem, this);
        }, this);
        
        // If there's no pending row to commit, there are no rows...
        // No items or just items with no text -> hide
        if(!row){
            return new pvc.Size(0,0);
        }
        
        commitRow(/* isLast */ true);
        
        // In logical "row" naming 
        def.set(this.vars, 
            'rows',     rows,
            'rowCount', row,
            'size',     contentSize);
        
        var isV1Compat = this.compatVersion() <= 1;
        var requestSize = def.set({},
                // Request used width / all available width (V1)
                a_width,  isV1Compat ? clientSize[a_width] : contentSize.width,
                a_height, Math.min(contentSize.height, clientSize[a_height]));
        
        return requestSize;
        
        function layoutItem(itemScene){
            // The names of props  of textSize and itemClientSize 
            // are to be taken literally.
            // This is because items, themselves, are always laid out horizontally...
            var textSize = itemScene.labelTextSize();
            
            var hidden = !textSize || !textSize.width || !textSize.height;
            itemScene.isHidden = hidden;
            if(hidden){
                return;
            }  
            
            // Add small margin to the end of the text eq to 0.5em
            var widthMargin = 0;// (textSize.height / 2);
            
            // not padded size
            var itemClientSize = {
                width:  textLeft + textSize.width + widthMargin,
                height: Math.max(textSize.height, markerDiam)
            };
            
            // -------------
            
            var isFirstInRow;
            if(!row){
                row = new pvc.visual.legend.BulletItemSceneRow(0);
                isFirstInRow = true;
            } else {
                isFirstInRow = !row.items.length;
            }
            
            var newRowWidth = row.size.width + itemClientSize[a_width]; // or bottom
            if(!isFirstInRow){
                newRowWidth += padding[a_width]; // separate from previous item
            }
            
            // If not the first column of a row and the item does not fit
            if(!isFirstInRow && (newRowWidth > maxRowWidth)){
                commitRow(/* isLast */ false);
                
                newRowWidth = itemClientSize[a_width];
            }
            
            // Add item to row
            var rowSize = row.size;
            rowSize.width  = newRowWidth;
            rowSize.height = Math.max(rowSize.height, itemClientSize[a_height]);
            
            var rowItemIndex = row.items.length;
            row.items.push(itemScene);
            
            def.set(itemScene.vars,
                    'row', row, // In logical "row" naming
                    'rowIndex', rowItemIndex, // idem
                    'clientSize', itemClientSize);
        }
        
        function commitRow(isLast){
            var rowSize = row.size;
            contentSize.height += rowSize.height;
            if(rows.length){
                // Separate rows
                contentSize.height += padding[a_height];
            }
            
            contentSize.width = Math.max(contentSize.width, rowSize.width);
            rows.push(row);
            
            // New row
            if(!isLast){
                row = new pvc.visual.legend.BulletItemSceneRow(rows.length);
            }
        }
    }
});

def
.type('pvc.visual.legend.BulletItemSceneRow')
.init(function(index){
    this.index = index;
    this.items = [];
    this.size  = {width: 0, height: 0};
});