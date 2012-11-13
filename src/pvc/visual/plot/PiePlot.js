def.scope(function(){

    /**
     * Initializes a pie plot.
     * 
     * @name pvc.visual.PiePlot
     * @class Represents a pie plot.
     * @extends pvc.visual.Plot
     */
    def
    .type('pvc.visual.PiePlot', pvc.visual.Plot)
    .add({
        type: 'pie',
        
        _getOptionsDefinition: function(){
            return pvc.visual.PiePlot.optionsDef;
        }
    });
    
    pvc.visual.PiePlot.optionsDef = def.create(
        pvc.visual.Plot.optionsDef, {
            ActiveSliceRadius: {
                resolve: '_resolveFull',
                cast:    pvc.PercentValue.parse,
                value:   new pvc.PercentValue(0.05)
            },
            
            ExplodedSliceRadius: {
                resolve: '_resolveFull',
                cast:    pvc.PercentValue.parse,
                value:   0
            },
            
            ExplodedSliceIndex:  {
                resolve: '_resolveFull',
                cast:    pvc.castNumber,
                value:   null // all exploded when radius > 0
            },
            
            ValuesAnchor: { // override
                cast:  pvc.parseAnchorWedge,
                value: 'outer'
            },
            
            ShowValues: { // override
                value: true
            },
            
            ValuesLabelStyle: {
                resolve: pvc.options.resolvers([
                    '_resolveFixed',
                    '_resolveNormal',
                    '_resolveDefault',
                    function(optionInfo){
                        var isV1Compat = this.chart.compatVersion() <= 1;
                        optionInfo.defaultValue(isV1Compat ? 'inside' : 'linked');
                        return true;
                    }
                ]),
                cast: function(value) {
                    switch(value){
                        case 'inside':
                        case 'linked': return value;
                    }
                    
                    if(pvc.debug >= 2){
                        pvc.log("[Warning] Invalid 'ValuesLabelStyle' value: '" + value + "'.");
                    }
                    
                    return 'linked';
                }
            },
            
            // Depends on being linked or not
            // Examples:
            // "{value} ({value.percent}) {category}"
            // "{value}"
            // "{value} ({value.percent})"
            // "{#productId}" // Atom name
            ValuesMask: { // OVERRIDE
                resolve: pvc.options.resolvers([
                    '_resolveFull',
                    function(optionInfo){
                        optionInfo.defaultValue(
                            this.option('ValuesLabelStyle') === 'linked' ? 
                            "{value} ({value.percent})" : 
                            "{value}");
                        return true;
                    }
                ])
            },
            
            /* Linked Label Style
             *                                         
             *     (| elbowX)                         (| anchorX)
             *      +----------------------------------+          (<-- baseY)
             *      |                                    \
             *      |   (link outset)                      \ (targetX,Y)
             *      |                                        +----+ label
             *    -----  <-- current outer radius      |<-------->|<------------>            
             *      |   (link inset)                     (margin)   (label size)
             *      
             */
            
            /**
             * Percentage of the client radius that the 
             * link is inset in a slice.
             */
            LinkInsetRadius:  {
                resolve: '_resolveFull',
                cast:    pvc.PercentValue.parse,
                value:   new pvc.PercentValue(0.05)
            },
            
            /**
             * Percentage of the client radius that the 
             * link extends outwards from the slice, 
             * until it reaches the link "elbow".
             */
            LinkOutsetRadius: {
                resolve: '_resolveFull',
                cast:    pvc.PercentValue.parse,
                value:   new pvc.PercentValue(0.025)
            },
            
            /**
             * Percentage of the client width that separates 
             * a link label from the link's anchor point.
             * <p>
             * Determines the width of the link segment that 
             * connects the "anchor" point with the "target" point.
             * Includes the space for the small handle at the end.
             * </p>
             */
            LinkMargin: {
                resolve: '_resolveFull',
                cast:    pvc.PercentValue.parse,
                value:   new pvc.PercentValue(0.025)
            },
            
            /**
             * Link handle width, in em units.
             */
            LinkHandleWidth: {
                resolve: '_resolveFull',
                cast:    pvc.castNumber,
                value:   0.5
            },
            
            /**
             * Percentage of the client width that is reserved 
             * for labels on each of the sides.
             */
            LinkLabelSize: {
                resolve: '_resolveFull',
                cast:    pvc.PercentValue.parse,
                value:   new pvc.PercentValue(0.15)
            },
            
            /**
             * Minimum vertical space that separates consecutive link labels, 
             * in em units.
             */
            LinkLabelSpacingMin: {
                resolve: '_resolveFull',
                cast:    pvc.castNumber,
                value:   0.5
            }
        });
});