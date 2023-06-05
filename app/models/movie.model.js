const { mongoose } = require( "mongoose" ) ;


module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
        movie_id : Number ,
        movie_name : String ,
        movie_language : String ,
        movie_popularity : Number , //popularity decided by number of ticket books
        movie_cost_per_ticket : Number //increment 1% as per popularity
        }
    )
    const movie = mongoose.model( "movie" , schema )
    return movie
} ;