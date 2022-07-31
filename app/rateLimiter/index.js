const Redis  = require('../redis/redis')
/**
 * 
 * @param {String} bindOn 
 * @param {Number} requestLimit 
 * @param {Number} timeLimit 
 * @returns void
 */
exports.tokenBucket = (bindOn,requestLimit,timeLimit)=>{
    return function(req,res,next){
        let key = ""; 
        switch(bindOn){
            case "UserAgent":
                key  = req.headers['user-agent'];
            case "ip":
                key  = req.ip;
        }
        Redis.incr(key).then(num=>{
            if(num ===1){
                Redis.expire(key,timeLimit);
                next()
            }
            else if(num > requestLimit){
                 return res.status(401).json({'limit': 'limit accessed'});
            }
            else {
                next();
            }
        });
    }
}

