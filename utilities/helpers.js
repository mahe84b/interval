module.exports = {
getMinOrMax: function(array, type) {
  if(type == 'min') {
      Array.min = function( array ){
          return Math.min.apply( Math, array );
      };
   } 
   if(type == 'max') {
      Array.max = function( array ){
          return Math.max.apply( Math, array );
      };
   }
  }
};