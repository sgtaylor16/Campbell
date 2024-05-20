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
                        .range([height - this.margin.bottom,this.margin.top])  
    }

    createplot(){
        //Creates the figure in the plot
        let svg = d3.select(this.divtag)
        .append("svg")
        .attr("width",this.width)
        .attr("height",this.height)

        svg.append("g")
            .attr("id",'axisleft')
            .attr("transform",`translate(${this.margin.left},0)`)
            .call(d3.axisLeft(this.yScale))

        svg.append("g")
            .attr('id','axisbottom')
            .attr("transform",`translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(this.xScale))
    }

}

export class CompMap extends BasePlot {

    createplot(){
        super.createplot()

        const svg = d3.select(this.divtag).select("svg");

        console.log(this.width)

        svg.selectAll("line.horizontalGrid").data(this.yScale.ticks()).enter()
            .append("line")
            .attr("class","horizongalGrid")
            .attr("x1",this.margin.right)
            .attr("x2",this.width)
            .attr("y1", d => this.yScale(d))
            .attr("y2", d => this.yScale(d))
            .attr("fill","none")
            .attr("shape-rendering","crispEdges")
            .attr("stroke","lightgrey")
            .attr("stroke-width","1px")

    }

    createline(plotarray,{
        color= 'black',
        linehover=null

    }={}){
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

        if(linehover != null){

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
                    .text(linehover)
            })
            .on("mouseleave",function (e,d){
                label.attr("display","none")
            })
        }
    }
}

function generatePoints(n) {
    let points = [];
    if(n==1){
        return [0.5]
    }
    else{
        for(let i = 0; i < n; i++) {
            points.push(i / (n - 1));
        }
        return points;
    }
}

export class Skyline extends BasePlot {

    createplot(){
        super.createplot()
        let svg = d3.select(this.divtag)
        let group = svg.select("#axisbottom").remove()
    }


    createline(plotarray,{
        color="black"
    }={}){

        let svg = d3.select(this.divtag).select("svg");

        let pathgenerator = d3.line()
                                .x( d => this.xScale(d[this.xkey]))
                                .y( d => this.yScale(d[this.ykey]))
                                .curve(d3.curveStepAfter)

        let line = svg.append("path")
                        .attr("d",pathgenerator(plotarray))
                        .attr("stroke",color)
                        .attr("fill","none");
    }

    createSpeedLine(x,y,npts,scale){
        const svg = d3.select(this.divtag).select("svg");

        const divstring = `x-${x}y-${y}`

        const newgroup = svg.append("g")
            .attr("id",divstring)

        function speedcurve(t,xshift,yshift,scale){
            return {"x":scale* (-t) + xshift,"y":-scale*8 *(t * Math.log(t+1) -t) + yshift}
        }
        
        const curvePts = [0,.2,.4,.6,.8,1];
        let curvePts2 = [];
        for(let i=0;i<curvePts.length;i++){
            curvePts2.push(speedcurve(curvePts[i],x,y,scale))
        }

        let pathgenerator = d3.line()
                    .x(d => this.xScale(d['x']))
                    .y(d => this.yScale(d['y']))
                    .curve(d3.curveBasis);

        let line = newgroup.append("path")
                    .attr("d",pathgenerator(curvePts2))
                    .attr("stroke",'black')
                    .attr("fill","none");

        let ptArray = generatePoints(npts);

        let ptObj = [];
        for(let i=0;i < ptArray.length;i++){
            ptObj.push(speedcurve(ptArray[i],x,y,scale))
        }
        let pts = newgroup.selectAll("circle")
                    .data(ptObj)
                    .join("circle")
                    .attr("cx",d => this.xScale(d['x']))
                    .attr("cy",d => this.yScale(d['y']))
                    .attr("r",5)
                    .attr("fill","none")
                    .attr("stroke",'red')
                    .attr("stroke-width",1.5)
                    .attr("class",'speed-lines')
    }

    addDot(ptarray,{
        color='grey',
        radius= d=>5
    }={}){
        const svg = d3.select(this.divtag).select("svg");

        let pts = svg.selectAll("circle.pts")
            .data(ptarray)
            .join("circle")
            .attr("cx",d => this.xScale(d[this.xkey]))
            .attr("cy",d => this.yScale(d[this.ykey]))
            .attr("r",radius)
            .attr("fill",color)
    }

}