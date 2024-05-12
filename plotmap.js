import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
//Package to Plut Compressor / Fan Maps

export function fanmap(data,divtag,speedarray,{
    margin = {left:60,right:60,top:40,bottom:40},
    width = 400,
    height = 300,
    speedkey = "% Nc",
    flowkey = 'flow',
    prkey = 'PR'

} ={}){

    let div = d3.select(divtag);
    let svg = div.append("svg")
                .attr("width",width)
                .attr("height",height);

    let speedlines = data['fanmap'];

    let xScale = d3.scaleLinear()
                    .domain([0,d3.max(speedlines,d => d[flowkey])])
                    .range([margin.left,width-margin.right]);

    let yScale = d3.scaleLinear()
                    .domain([d3.min(speedlines,d=>d[prkey]),d3.max(speedlines,d=>d[prkey])])
                    .range([height - margin.top,margin.bottom]);

    let linegen = d3.line()
        .x(d2 => xScale(d2[flowkey]))
        .y(d2 => yScale(d2[prkey]));
                    
    speedarray.forEach(speed => {
        let oneline = speedlines.filter(d1 => d1[speedkey] == speed);
        oneline = d3.sort(oneline,d3 => d3[flowkey])

        svg.append("path")
            .attr("d",linegen(oneline)).attr("stroke","black")
                                        .attr("fill","none")
    });

    //Plot the opline
    const stallline = data['stallline'];

    svg.append("path")
        .attr("d",linegen(stallline)).attr("stroke","black")
                                   .attr("fill","none")

    svg.append("g")
        .attr("transform",`translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale))

    svg.append("g")
        .attr("transform",`translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
}

export class CompMap {
    constructor(height,width,divtag,xdomain,ydomain,xkey,ykey){
        this.height = height;
        this.width = width;
        this.divtag = divtag;
        this.xdomain = xdomain;
        this.ydomain = ydomain;
        this.xkey = xkey;
        this.ykey = ykey;
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

    createline(plotarray,color="black"){
        let svg = d3.select(this.divtag).select("svg");

        let pathgenerator = d3.line()
                                .x( d => this.xScale(d[this.xkey]))
                                .y( d => this.yScale(d[this.ykey]));

        svg.append("path")
            .attr("d",pathgenerator(plotarray))
            .attr("stroke",color)
            .attr("fill","none");
    }
}