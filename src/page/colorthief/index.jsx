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
        this.disX = 0;
        this.disY = 0;

        this.state = {
            maincolor: [0, 255, 255],
            palettecolor: [0, 255, 255],
            sendcolorwheel: [0, 255, 255],
            needX: 0,
            needY: 0
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
        // console.log(data)
        colorWheel.bindData(data);
    }

    chooseColor(color) {
        this.setState({
            sendcolorwheel: color
        })
    }

    fnDown(e) {
        // 第二步：记录拖拽起始位置，鼠标按下时document绑定onmousemove事件，实时改变元素的布局style
        console.log(e.clientX)
        console.log(e.target.offsetLeft)
        this.disX = e.clientX - e.target.offsetLeft;
        this.disY = e.clientY - e.target.offsetTop;
        document.onmousemove = this.fnMove.bind(this);
    }
    fnMove(e) {
        let x, y
        if(e.offsetLeft < 0) {
            x = 200
        }else {
            x = e.clientX - this.disX   
        }

        this.setState({
            needX: x,
            needY: e.clientY - this.disY
        })
    }
    fnUp() {
        // 第三步：鼠标放开时document移除onmousemove事件
        document.onmousemove = null
    }

    render() {
        return (
            <div className="colorthief">
                <div className="drag-area">
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
                        // console.log(palette)
                        this.setState({
                            maincolor: result,
                            palettecolor: palette
                        });
                        }} />
                    <div className="dragable" style={{left:this.state.needX,top:this.state.needY}}
                        onMouseDown = {this.fnDown.bind(this)}
                        onMouseUp = {this.fnUp.bind(this)}
                    ></div>
                </div>
                
                
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