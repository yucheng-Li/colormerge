import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import Colorthief from './page/colorthief/index'
import Colorwheel from './page/colorwheel/index'

ReactDOM.render(
    <div className="content">
      <Colorthief />
      <Colorwheel />
    </div>
  ,
  document.getElementById('root')
);

