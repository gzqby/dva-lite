Dva-lite is a toy of redux-middleware now. Be careful using in proction environment
## Usage
### install
git clone git@github.com:zgoby/dva-lite.git // Yeaah, it's toy now, no npm-module
### API
```
const app = dva();

app.use(`somePlugin`);

app.model(`model`);

// APP is used ReactDOM.render(APP,...);
app.route(`APP`)

// app is mounted in element
app.start(`element`)
```
