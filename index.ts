import { Application, Context } from 'egg';
import 'reflect-metadata';

const CONTROLLER_PREFIX_META = 'CONTROLLER_PREFIX_META';
const METHOD_META = 'METHOD_META';
const PATH_META = 'PATH_META';

export interface ActionResult {
  code: number;
  message: string;
  data: any;
}

export enum Methods {
  ALL = 'all',
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch',
  OPTIONS = 'options',
  HEAD = 'head',
}

export const controllerMap = new Map();
/**
 * 增加前缀路径到对应的controller
 * @param prefix 类路由前缀
 */
export function Prefix(prefix: string = ''): ClassDecorator {
  return targetClass => {
    Reflect.defineMetadata(CONTROLLER_PREFIX_META, prefix, targetClass);
  };
}

export function RequestMethods(methods: Methods|string|Methods[]|string[]) {
  return (target, _key: any, descriptor) => {
    controllerMap.set(target, target);
    methods = typeof methods === 'string' ? [methods] : methods;
    Reflect.defineMetadata(METHOD_META, methods, descriptor.value);
  };
}

export function Path(path: string= '/') {
  return (target, _key: any, descriptor) => {
    controllerMap.set(target, target);
    Reflect.defineMetadata(PATH_META, path, descriptor.value);
  };
}
/**
 * 加载装饰器路由
 * @param app Application
 * @param globalPrefix 全局路由前缀,可选参数
 */
export function RouteLoader(app: Application, globalPrefix: string = '') {
  const { router } = app;
  controllerMap.forEach(controller => {
    const controllerPrefix = Reflect.getMetadata(CONTROLLER_PREFIX_META, controller.constructor) || '';
    Object.getOwnPropertyNames(controller).filter(
      (funcName: string) => funcName !== 'constructor' && funcName !== 'pathName' && funcName !== 'fullPath',
    ).forEach((funcName: string) => {
      const path = Reflect.getMetadata(PATH_META, controller[funcName]);
      const methods = Reflect.getMetadata(METHOD_META, controller[funcName]) || ['GET']; // 默认方法为get
      // 跳过没有注册Path的Controller函数
      if (path === undefined) return;
      const func = (ctx: Context, ...args: any[]) => {
        const instacne = new (controller.constructor as any)(ctx);
        return instacne[funcName](...args);
      };
      // 注册路由
      methods.forEach((method: Methods) =>
        router[method.toLowerCase()](globalPrefix + controllerPrefix + path, func));
      // 打印路由
      console.log('route:', globalPrefix + controllerPrefix + path, '===========> func:', controller.pathName + '.' + funcName);
    });
  });
}
