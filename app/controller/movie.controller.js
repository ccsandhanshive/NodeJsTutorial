const db = require("../models");
const movie = db.movies;

//For add or create new movie
exports.addMovie = ( req , res ) => {
    
    movie.findOne().sort( { movie_id : -1 } ).limit( 1 ).exec( function( err , data ) {  //for id autoincrement
        let counter = 0
        if( data != null)
            counter = data.movie_id                        //Get current id

        //Original Cost  --> will not store in database
        const originalCost = req.body.originalCost 

        //Movie popularity
        const  movie_popularity = req.body.movie_popularity ? req.body.movie_popularity : 0  
        
        //Create Object of Movie
        const newMovie = new movie( {
            //Movie id 
             movie_id : counter+1,
        
             //Movie name
            movie_name : req.body.movie_name, 
            
            //Movie language
            movie_language : req.body.movie_language, 
            
            //Movie popularity          
            movie_popularity : movie_popularity,
            
            //Movie Cost per ticket --> Update base on popularity
           movie_cost_per_ticket : calculateMovieCostPerTicket( originalCost , movie_popularity ) 
        }

        ) ;
        if( originalCost >= 0 && movie_popularity >= 0 && newMovie.movie_cost_per_ticket >= 0 ) {   //Check all values should positive(peer changes)
            newMovie.save( newMovie ).then( data => {
            
            //Send responce with original cost 
            res.send( { data , "original cost" : originalCost } ) ;
        
            } ).catch( err => {
                res.status( 500 ).send( {
                message:"error in saving Movie in Database"
                    } ) ;
            } ) ;
        
        }else {
            res.send( "All Values Should be positive number or 0" )
        }
    } ) ;
    
}



//For calculate original Cost
calculateOriginalCost = ( costPerTicket , moviePopularity ) => {
   return Math.round( parseInt( costPerTicket ) / ( 1 + ( parseInt( moviePopularity ) / 100 ) ) )   //decrese Cost per ticket by 1% as per popularity
}



//For calculate Movie cost per tiket
calculateMovieCostPerTicket = ( originalCost , moviePopularity ) => {
    return Math.round( originalCost * ( 1 + ( parseInt( moviePopularity ) / 100 ) ) )           //Increase Original cost by 1% as per popularity
}



//Update Movie
exports.updateMovie = ( req , res ) => {
    //Get Movie id from Admin
    const movie_id = req.body.movie_id
    
    //Find base on movie id 
    movie.findOne( { movie_id : movie_id } , function( err , data ) {
        if ( data == null ) {                     //If movie id not found
            res.send( "movie id not found" )
        }else {                              //If movie id found
        
            /*Get movie name and/or movie language and/or movie popularity  from admin
        If any details not given except movie id it will fetch from current data in database*/
        
        const movie_name = req.body.movie_name ? req.body.movie_name : data.movie_name
        const movie_language = req.body.movie_language ? req.body.movie_language : data.movie_language
        const movie_popularity = req.body.movie_popularity ? req.body.movie_popularity : data.movie_popularity
        
        //Get Original Cost from admin if not given it will calculate base on data present in database
        const originalCost =req.body.originalCost ? req.body.originalCost : calculateOriginalCost( data.movie_cost_per_ticket , data.movie_popularity )
        
        //movie_cost_per_ticket will update base on movie_popularity 
        const movie_cost_per_ticket = calculateMovieCostPerTicket( originalCost , movie_popularity )
        
        if ( originalCost >= 0 && movie_popularity >= 0 && movie_cost_per_ticket >= 0 ) {   //Peer changes
        
        //Find movie by movie id and update data
        movie.findOneAndUpdate( { movie_id : data.movie_id } , {
            movie_name : movie_name ,
            movie_language : movie_language ,
            movie_popularity : movie_popularity ,
            movie_cost_per_ticket : movie_cost_per_ticket


        } ).then( data => {
               
            res.send("Updated")

        } ).catch( err => {
                    res.status( 500 ).send( {
                    message:"Movie not updated"
                    } ) ;
                } ) ;
            }else {
                res.send("All values should be positive or 0")
            }
        }
    } ).catch( err => {
            res.status(500).send( {
            message:"Id not found"
            } ) ;
        } ) ;
}



//For id maintainance after remove operation
updateMovieIdAfterRemove = ( movieId ) => {
    //Initially counter set to 1
    movieId=parseInt(movieId)
    var counter = 0
   console.log(movieId)
    //find all records which is movie id greter than given movie id
    movie.find( { movie_id : { $gt : movieId } } , function( err , dataCollection ) {
        if( err ) throw err;
        console.log(dataCollection)
        for(let data of dataCollection ) {
          console.log(data)
            //Update all movie ids
            movie.findOneAndUpdate({ movie_id:data.movie_id }, { movie_id:data.movie_id-1}, function(err, user) {
                if (err) throw err;
              
                console.log("Id updated");
              }); 
           
        }
    } ).catch( err => {
       res.status( 500 ).send( {
           message:'unable to find id'
       } ) ;
   } ) ;
}




//Delete Movie Name
exports.deleteMovie = ( req , res ) => {
    //Movie Id
    const movie_id = parseInt(req.body.movie_id)

    // Find Movie by movie Id and remove
    movie.findOneAndRemove( { movie_id : movie_id } , function( err , data ) {
        if( data == null ) {
            res.send( {
                message:`id ${movie_id} not found`
            } ) ;
        }else {
                res.send( "data removed" )
                updateMovieIdAfterRemove( movie_id ) //For Movie id maintanance
        }
} ) ;
}




//For get Array of original cost
returnOriginalCostArray = ( dataCollection ) => {
    let originalCostArray = []
    for(let data of dataCollection) {
        //Calculate Original Cost
        const originalCost = calculateOriginalCost( data.movie_cost_per_ticket , data.movie_popularity )

        //Push data in array
        originalCostArray.push( { "movie_id" : data.movie_id , "movie_original_cost" : originalCost } )
    }
    return originalCostArray
}



//Get List of all Movie  
exports.listAllMovies = ( req , res ) => {
    movie.find( { } , function( err , dataCollection ) {
        if ( err ) throw err;

        
        if ( dataCollection == null ) {
            res.send( "data not found" )        //If Data not Available
        } else { 
                originalCostArray = returnOriginalCostArray( dataCollection )       //create array of original cost with repect to movie id
                res.send( { dataCollection , originalCostArray } )
        }
    });
}


//find movie id in provided data
findMovieIdInData = ( dataCollection , movie_id ) => {
    for ( let data of dataCollection ) {
        if ( data.movie_id == movie_id ) {
            return true;
        }
    }
    return false;
}


//operation of updation in getByPopularity
popularityBaseUpdation = ( res , movie_id , numberOftickets , lessThanVal , greaterThanVal ) => { 
    
    movie.find( { $and : [ { movie_popularity : { $gt : greaterThanVal } } , { movie_popularity : { $lt : lessThanVal } } ] } , function ( err , dataCollection ) {
        if ( dataCollection.length == 0 ) {     //If data not found
            
            res.send( "data not found" )
        
        } else if ( movie_id == null && numberOftickets == null ) {     //If user not provide movie id and number of tickets
           
            res.send( dataCollection )                                  //Return feched data
        
        } else if ( movie_id != null && numberOftickets == null ) {     // if user not provide number of tickets 
           
            res.send( "plz Enter number of tickets" )
        
        } else if ( movie_id == null && numberOftickets != null ) {     //If user not provide movie id
           
            res.send( "plz Enter movie id" )

        }else{                                                          //If user provide both movie id and number of tickets
            
            if( findMovieIdInData( dataCollection , movie_id ) ) {      //check movie id present in selected data or not
                
                movie.findOne( { movie_id : movie_id } , function( err , data ) {
                    const originalCost = calculateOriginalCost( data.movie_cost_per_ticket , data.movie_popularity )
                    const movie_popularity = data.movie_popularity + numberOftickets   //Increse popularity as per booked tickets
                    const movie_cost_per_ticket = calculateMovieCostPerTicket( originalCost , movie_popularity )  
                        
                        movie.findOneAndUpdate( { movie_id : data.movie_id } , { movie_popularity : movie_popularity , movie_cost_per_ticket : movie_cost_per_ticket } ).then( data => {
                            res.send( "Cost updated" )
                        } ).catch( err => {
                                res.status( 500 ).send( {
                                message:"Movie not updated"
                                } ) ;
                    } ) ;
                
        } ).catch( err => {
                res.status( 500 ).send( {
                message:"Movie not found"
                } ) ;
            
        } ) ;
    } else {
        res.send( `movie id ${movie_id} not found in selected popularity` )
    }
    }
} ).catch( err => {
    res.status( 500 ).send( {
    message:"Movie not found"
         } ) ;
} ) ;

}



//Get movie By Popularity Operation
exports.getMovieByPopularity = ( req , res ) => {
    //0-> not populer , 1->less populer 2->most populer
    let popularity = req.query.popularity ;
    const numberOftickets = req.body.numberOftickets ? req.body.numberOftickets : null
    const movie_id = req.body.movie_id ? req.body.movie_id : null
    
    popularity = parseInt( popularity ) 
    switch( popularity ) {
        case 0 :    
            //if ( movie popularity between ( 0 , 50 ) ) => not populer                                
            popularityBaseUpdation( res , movie_id , numberOftickets , 50 , 0 ) ;
              break;
        
        case 1 :    
            //if ( movie popularity between ( 50 , 100 ) ) => less populer                   
            popularityBaseUpdation( res , movie_id , numberOftickets , 100 , 50 ) ;
            break
        case 2:       
            //if ( movie popularity between ( 100 , 90000000 ) ) => most populer                            
            popularityBaseUpdation( res , movie_id , numberOftickets , 90000000 , 100 ) ;
            break
        default:
             //If user gives wrong input                                       
            res.send( "Wrong input" )
    }
  
}