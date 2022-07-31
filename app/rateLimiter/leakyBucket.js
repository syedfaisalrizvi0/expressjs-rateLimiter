let tinterval = null;
const process = require("process");
/**
 * this is the leaky bucket implementation in expressjs
 */
class LeakyBucket {
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
    if ((await this.getCount()) < 60) {
      await this.client.rPush(this.containerName, this.key);
    } else {
      return this.res.status(401).json({ limit: "limit full" });
    }
    this.setinterval();
    this.next();
  }
  /**
   *
   */
  async getCount() {
    return await (
      await this.client.lRange(this.containerName, 0, -1)
    ).length;
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
      tinterval = setInterval(async () => {
        await this.client.rPop(this.containerName);
        if ((await this.getCount()) < 1) {
          clearInterval(tinterval);
          tinterval = null;
        }
      }, this.interval);
    }
  }
  /**
   * check memory uses
   */
  memory() {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(
      `The script uses approximately ${Math.round(used * 100) / 100} MB`
    );
  }
}
module.exports =
  (capacity = 60, interval = 1000, bindOn = "ip") =>
  (req, res, next) => {
    /**
     * we will auto-import the class  of Leaky bucket
     */
    new LeakyBucket(capacity, interval, bindOn, req, res, next);
  };
