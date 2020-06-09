## Usage

### controller
```javascript
import { Prefix, RequestMethods, Path } from 'basil-decorator-route';

@Prefix('/user')
export default class UserController extends Controller {
    @RequestMethods(['GET', 'POST'])
    @Path('/example')
    public index() {
        const { ctx } = this;
        ctx.body = { msg: 'success' };
    }
}
```
### router
```javascript

import { RouteLoader } from 'egg-route-decorators';
export default ()=>{
    RouteLoader(app, '/api/v1');
}
```
