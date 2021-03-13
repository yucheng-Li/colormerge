import React,{ Component } from 'react'
import './index.scss'
// import d3 from 'd3'
// import tinycolor from 'tinycolor'
import  ColorWheel from './newcolorwheel'



export default class Colorwheel extends Component {

    constructor(props) {
        super(props);
        this.state = {
           
        }
    }
    componentDidUpdate() {
        // const colorWheel = new ColorWheel();
        // var data = {
        //     color: { r: 88, g: 45, b: 0 }
        // };
        // colorWheel.bindData(data);
        
    }
    render() {
        return (
            <div className="colorwheel" id="colorwheel">
               
            </div>
        )
    }
}