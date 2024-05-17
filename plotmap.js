import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
//Package to Plut Compressor / Fan Maps

class BasePlot {
    constructor(width,height,divtag,xdomain,ydomain,xkey,ykey){
        this.height = height;  //Height of the figure in pixels
        this.width = width; //Width of the figure in pixels
        this.divtag = divtag; //Selector string for the div the svg will be placed in.
        this.xdomain = xdomain; //Array of min and maximum for x axis
        this.ydomain = ydomain; // Array of min and maximimum for y axis
        this.xkey = xkey;  // Key in the object for x axis
        this.ykey = ykey; //Key in the data object for the y axix
        this.margin = {left:40,right:40,top:40,bottom:40}

        this.xScale = d3.scaleLinear()
                        .domain(xdomain)
                        .range([this.margin.left,width-this.margin.right]
                        );

        this.yScale = d3.scaleLinear()
                        .domain(ydomain)
                        .range([height - this.margin.top,this.margin.bottom])  
    }

    createplot(){
        //Creates the figure in the plot
        let svg = d3.select(this.divtag)
        .append("svg")
        .attr("width",this.width)
        .attr("height",this.height)

        svg.append("g")
            .attr("transform",`translate(${this.margin.left},0)`)
            .call(d3.axisLeft(this.yScale))

        svg.append("g")
            .attr("transform",`translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(this.xScale))
    }
}

export class CompMap extends BasePlot {

    createline(plotarray,color="black",linelabel=null){
        // https://observablehq.com/d/3dc322b2ee5c02fc
        let svg = d3.select(this.divtag).select("svg");

        let pathgenerator = d3.line()
                                .x( d => this.xScale(d[this.xkey]))
                                .y( d => this.yScale(d[this.ykey]));

        const label = svg.append("text")
                        .attr("display","none");

        let line = svg.append("path")
            .attr("d",pathgenerator(plotarray))
            .attr("stroke",color)
            .attr("fill","none");

        line.on("mouseover",function (e,d){
            const [xm,ym] = d3.pointer(e);

            label
                .attr("display",null)
                .attr("font-size",15)
                .attr("font-weight","bold")
                .style("opacity",1)
                .attr("transform",`translate(${xm}, ${ym})`)
                .attr("dx",9)
                .attr("dy",-7)
                .text(linelabel)
        })
        .on("mouseleave",function (e,d){
            label.attr("display","none")
        })
    }
}

export class Skyline extends BasePlot {

    createline(plotarray,color="black"){

        let svg = d3.select(this.divtag).select("svg")

        let pathgenerator = d3.line()
                                .x( d => this.xScale(d[this.xkey]))
                                .y( d => this.yScale(d[this.ykey]))
                                .curve(d3.curveStepAfter)

        let line = svg.append("path")
                        .attr("d",pathgenerator(plotarray))
                        .attr("stroke",color)
                        .attr("fill","none");
    }

}