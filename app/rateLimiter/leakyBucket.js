let tinterval = null;
/**
 * this is the leaky bucket implementation in expressjs
 */
class LeakyBucket {
  static interval;
  constructor(capacity, interval, bindOn, req, res, next) {
    /**
     * bind interval
     */
    this.interval = interval;
    /**
     * bind native modules
     */
    this.req = req;
    this.res = res;
    this.next = next;
    /**
     * binding
     */
    this.bindOn = bindOn;
    /**
     * key name
     */
    this.containerName = "leakyBucket";
    /**
     *  the capecity referr to the size of the bucket
     *  means how much requests a bucket can hold
     */
    this.capacity = capacity;
    /**
     * redis client
     */
    this.client = require("../redis/redis");
    /**
     *  set key
     */
    this.key = this.getKey();
    this.pushItem();
  }
  /**
   *
   * @param {} data
   */
  async pushItem() {
    let push = await this.client.rPush(this.containerName, this.key);
    if (push >= 60) {
      return this.res.status(401).json({ limit: "limit full" });
    }
    this.setinterval();
    this.next();
  }
  /**
   * @returns String
   */
  getKey() {
    switch (this.bindOn) {
      case "UserAgent":
        return this.req.headers["user-agent"];
      case "ip":
        return this.req.ip;
    }
  }
  /**
   * set the interval
   */
  setinterval() {
    if (!tinterval) {
      console.log("added interval");
      tinterval = setInterval(async () => {
        await this.client.rPop(this.containerName);
        console.log("poping....");
        if ((await this.client.lRange(this.containerName, 0, -1)).length <= 1) {
          clearInterval(tinterval);
          tinterval = null;
        }
      }, this.interval);
    }
  }
}
module.exports = (capacity = 60, interval = 1000, bindOn = "ip") => {
  return (req, res, next) => {
    /**
     * we will auto-import the class  of Leaky bucket
     */
    new LeakyBucket(capacity, interval, bindOn, req, res, next);
  };
};
