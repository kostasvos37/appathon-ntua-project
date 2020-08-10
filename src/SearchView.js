import React, { Component } from 'react';
import {getDistance, getPreciseDistance} from 'geolib'
import { withRouter } from "react-router";
import Loader from 'react-loader-spinner';
import qs from 'query-string';
import "./forms.css";
const MakeItem = function(X) {
    return <option>{X}</option>;
};

class Select extends Component{    

    render(){
        return(
            <React.Fragment>
            <label>{this.props.label}</label>
            <select className="custom-select" key={1} name ={this.props.name}>
                {this.props.options.map(MakeItem)}
            </select>
        </React.Fragment>
        )}
}



class SearchView extends React.Component{

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelectRoute = this.handleSelectRoute.bind(this);
        this.findTenClosest = this.findTenClosest.bind(this)
        this.state = {
            stops : [],
            coords : [],
            renderStops : [],
            routes : [],
            text : "Select Stop",
            componentRender : "stops"
        }
    }

    // Polyyyyyyyyy xazos tropos alla douleuei
    findTenClosest(pos, coordinates, names){
        var dists = coordinates.map((element) =>{
            return getDistance({latitude : pos[0], longitude:pos[1]}, {latitude : element[0], longitude:element[1]}, 0.01)
        })
        var obj = []
        for (var i=0; i<names.length; i++){
            obj.push({name: names[i], dist: dists[i]});
        }
        obj = obj.sort((a,b) => (a.dist - b.dist))
        return (obj.map((a) => a.name).slice(0, 10))
    }

    componentDidMount(){
        var [ ,queryString] = window.location.href.split("?");
        queryString = qs.parse(queryString)
        
        const query = "http://feed.opendata.imet.gr:23577/itravel/devices.json"

        this.setState  ({componentRender : "load" }) 
        fetch(query).then((response) => response.json())
        .then(json => {
            var returnedStops = []
            var returnedCoords = []
            for (var i in json){
                returnedStops.push(json[i]["device_Name"])
                returnedCoords.push([parseFloat(json[i]["lat"]), parseFloat(json[i]["lon"])])
            }
            // frankly terrible
            this.setState({coords: returnedCoords })
            this.setState({stops: returnedStops })

            if(!queryString){
                this.setState({renderStops : returnedStops}) 
            }else{
                const closest = this.findTenClosest([parseFloat(queryString.lat), parseFloat(queryString.lng)], returnedCoords, returnedStops)
                this.setState({renderStops: closest })
                this.setState({text: "Select Stop (10 Closest)"})
            }
            
            this.setState({componentRender : "stops" }) 
        });

    }

    handleSubmit(event){

        event.preventDefault()
        this.setState({componentRender : "load" })
        var selection = event.target.elements.stops.value
        
        const stopNum = this.state.stops.indexOf(selection)
        const stopPosition = this.state.coords[stopNum]
        console.log(stopPosition)

        const query = "http://feed.opendata.imet.gr:23577/itravel/paths.json"
        fetch(query).then((response) => response.json())
        .then(json => {
            
            var routesContainingStop = []
            for (var i in json){
                
                json[i]["polyline"].split(" ").map(x => x.split(",")).forEach(pos => {
                    // fml de dinoun akribws tis staseiw
                    // ti tha kanwwwwwwww
                    //console.log(`pos = ${stopPosition[0]}, linePos = ${Math.abs(parseFloat(pos[0]))}, diff = ${parseFloat(pos[0])-stopPosition[0]}`)
                    if((Math.abs(parseFloat(pos[0])-stopPosition[1])<0.0001) && (Math.abs(parseFloat(pos[1])-stopPosition[0])<0.0001) ){
                        routesContainingStop.push(json[i]["Path_Name"])
                        return;
                    } 
                });
            }
        this.setState({routes : routesContainingStop.filter((v, i, a) => a.indexOf(v) === i)})
        this.setState({componentRender : "routes" })
        });
    }




    handleSelectRoute(event){
        //this.setState({componentRender : "redirect" }) 
        this.props.history.push({
            pathname: '/result?route=1'
            })
        }


    render(){
        if(this.state.componentRender==="load"){
            return (
                    <Loader type="Oval"
                        color="#00BFFF"
                        height={100}
                        width={100}
                        />

            )
        }else if(this.state.componentRender==="stops"){
            return (
                
                <form className="booking-form" onSubmit = {this.handleSubmit}>
                
                    <Select label = {this.state.text} name = "stops" options = {this.state.renderStops}/>
                    <span className="input-grp">
                            <button type="submit" className="btn btn-primary flight">Show Results</button>
                    </span>
                </form>

        )}else if(this.state.componentRender === "routes"){
            return(
                <form className="booking-form" onSubmit = {this.handleSelectRoute} >
                    
                        <Select label = "Select Route" name = "routes" options = {this.state.routes}/>
                        <span className="input-grp">
                                <button type="submit" className="btn btn-primary flight">Show Results</button>
                        </span>
                </form>
            )
        }
    }
}

export default withRouter(SearchView);
