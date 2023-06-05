module.exports = app => {

const movies = require( "../controller/movie.controller.js" ) ;
var router = require( "express" ).Router( ) ;

//Admin Operations
router.post( "/admin/addMovie" , movies.addMovie ) ;
router.put( "/admin/updateMovie" , movies.updateMovie ) ;
router.delete( "/admin/deleteMovie" , movies.deleteMovie ) ;
router.get( "/admin/listAllMovie" , movies.listAllMovies ) ;
router.get( "/admin/getMovieByPopularity" , movies.getMovieByPopularity ) ;


//Fuzzy Operation for tesing perpose only
router.put( "/user/getMovieByPopularityAndUpdateCost" , movies.getMovieByPopularity );   


app.use( '/movies' , router ) ;
} ;