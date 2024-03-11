import fs from "node:fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "node:path";
import { DynamicPool, StaticPool } from "node-worker-threads-pool";

const dynamicPool = new DynamicPool(8);
export const expensive = async (param, calcFn) => {
  return await dynamicPool.exec({
    task: calcFn,
    param,
  });
};

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const dirPath = (...args) => path.join(__dirname, ...args);

export const loadJSON = (path) =>
  JSON.parse(fs.readFileSync(dirPath(path), "utf8"));

export const processImport = (dir, fileRegexp, forEachFileJSONCb) => {
  fs.readdirSync(dirPath(dir))
    .filter((file) => !!file.match(fileRegexp))
    .forEach((file) => {
      const curJSON = loadJSON(dir + "/" + file);
      curJSON.forEach(forEachFileJSONCb);
    });
};

/** Mutates target array by pushing values array into it in a flat fashion
 * E.g. flatPush([0], [1,2]) ==> [0,1,2]
 */
export const flatPush = (target, values) =>
  Array.prototype.push.apply(target, values);

/**  not real async, just for deferring expensive calculations after binding the port */
export const badLazy = (resolver) => {
  let lazyPromise = null;
  return async () => {
    if (!lazyPromise) {
      lazyPromise = new Promise(async (resolve) => resolve(await resolver()));
    }

    return lazyPromise;
  };
};

export const lazy = (resolver) => {
  const _result = null;

  return () => {
    if (_result) {
      return _result;
    }

    _result = resolver();
    return _result;
  };
};
