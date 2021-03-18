import React,{ PureComponent } from 'react'
import './index.scss'
// import ColorThief from 'color-thief-react'
import ColorThief from "colorthief";
import ColorWheel from  '../colorwheel/newcolorwheel'
const colorWheel = new ColorWheel();


export default class Colorthief extends PureComponent {

    constructor(props) {
        super(props);
        this.image = React.createRef();
        this.imgRef = React.createRef();
        this.color1 = React.createRef();
        this.color2 = React.createRef();
        this.color3 = React.createRef();
        this.color4 = React.createRef();
        this.color5 = React.createRef();

        this.state = {
            maincolor: [0, 255, 255],
            palettecolor: [0, 255, 255],
            sendcolorwheel: [0, 255, 255]
        }
    }
    
    componentDidUpdate() {
        this.imagemain.setAttribute('style', 'background-color:rgb'+'('+this.state.maincolor[0]+','+this.state.maincolor[1]+','+this.state.maincolor[2]+')')
        this.color1.setAttribute('style', 'background-color:rgb'+'('+this.state.palettecolor[0][0]+','+this.state.palettecolor[0][1]+','+this.state.palettecolor[0][2]+')')
        this.color2.setAttribute('style', 'background-color:rgb'+'('+this.state.palettecolor[1][0]+','+this.state.palettecolor[1][1]+','+this.state.palettecolor[1][2]+')')
        this.color3.setAttribute('style', 'background-color:rgb'+'('+this.state.palettecolor[2][0]+','+this.state.palettecolor[2][1]+','+this.state.palettecolor[2][2]+')')
        this.color4.setAttribute('style', 'background-color:rgb'+'('+this.state.palettecolor[3][0]+','+this.state.palettecolor[3][1]+','+this.state.palettecolor[3][2]+')')
        this.color5.setAttribute('style', 'background-color:rgb'+'('+this.state.palettecolor[4][0]+','+this.state.palettecolor[4][1]+','+this.state.palettecolor[4][2]+')')
        var data = {
            color: { r: this.state.sendcolorwheel[0], g: this.state.sendcolorwheel[1], b: this.state.sendcolorwheel[2] }
        };
        console.log(data)
        colorWheel.bindData(data);
    }

    chooseColor(color) {
        this.setState({
            sendcolorwheel: color
        })
    }

    render() {
        return (
            <div className="colorthief">
                <img
                    crossOrigin={"anonymous"}
                    ref={this.imgRef}
                    src={require('./girl.jpg')}
                    alt={"example"}
                    className={"example__img"}
                    onLoad={() => {
                    const colorThief = new ColorThief();
                    const img = this.imgRef.current;
                    const result = colorThief.getColor(img, 25); // 25 是什么意思
                    const palette = colorThief.getPalette(img, 5);
                    console.log(palette)
                    this.setState({
                        maincolor: result,
                        palettecolor: palette
                    });
                    }} />
                <div className="all">   
                    <div className="setcolor main-color" ref={image => { this.imagemain = image; }}></div> 
                    <div className="setcolor-box">
                        <div className="setcolor" ref={image => { this.color1 = image; }} onClick={() => this.chooseColor(this.state.palettecolor[0])}></div>
                        <div className="setcolor" ref={image => { this.color2 = image; }} onClick={() => this.chooseColor(this.state.palettecolor[1])}></div>
                        <div className="setcolor" ref={image => { this.color3 = image; }} onClick={() => this.chooseColor(this.state.palettecolor[2])}></div>
                        <div className="setcolor" ref={image => { this.color4 = image; }} onClick={() => this.chooseColor(this.state.palettecolor[3])}></div>
                        <div className="setcolor" ref={image => { this.color5 = image; }} onClick={() => this.chooseColor(this.state.palettecolor[4])}></div>
                    </div>
                </div>
            </div>
        )
    }
}