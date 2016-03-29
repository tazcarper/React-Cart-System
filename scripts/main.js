var React = require('react');
// Allows us to add dom elements
var ReactDOM = require('react-dom');
// Adds routing
var ReactRouter = require('react-router');

// Router vars
var Router = ReactRouter.Router;							
var Route = ReactRouter.Route;					
// var Navigation = ReactRouter.Navigation; 

// History allows us to navigate to differnet pages and maintain page history in 
var History = ReactRouter.History;

// Helpers
var helper = require('../scripts/helpers');							

// Create Browser History (Gets rid of # in URL)
var createBrowserHistory = require('history/lib/createBrowserHistory');

// Main Unique store page
var App = React.createClass({

	// Set initial state of fishes and order objects. Default key for init state.
	getInitialState: function(){
		return {
			fishes: {},
			order: {}
		}
	},
	addFish: function(fish){

		var timestamp = (new Date()).getTime();
		console.log(timestamp);

		// update the state object with new fish + timestamp
		this.state.fishes[`fish-${timestamp}`] = fish;

		// set the state. Be specific on what you are changing. We are changing the fishes object state. 
		// If we aren't specific, it will look through all the objects. Reduce comparison.
		this.setState({ fishes: this.state.fishes });

	},
	render: function(){
		return (
			<div className="catch-of-the-day">
				<div className="menu">
					<Header tagline="Fresh Seafood Market!"></Header>
				</div>
				<Order></Order>
				<Inventory addFish={this.addFish}></Inventory>
			</div>
		)
	}
});

// Add Fish Form
// <AddFishForm />

var AddFishForm = React.createClass({
	createFish: function(e){
		e.preventDefault();

		// Take the data and make a fish object
		var fish = {
			name : this.refs.name.value,
			price : this.refs.price.value,
			status : this.refs.status.value,
			desc : this.refs.desc.value,
			image : this.refs.image.value
		};

		// Add the fish to the app state
		this.props.addFish(fish);
		this.refs.fishForm.reset();
	},
	render: function(){
		return (
			<form className="fish-edit" ref="fishForm" onSubmit={this.createFish}>
		        <input type="text" ref="name" placeholder="Fish Name"/>
		        <input type="text" ref="price" placeholder="Fish Price" />
		        <select ref="status">
		          <option value="available">Fresh!</option>
		          <option value="unavailable">Sold Out!</option>
		        </select>
		        <textarea type="text" ref="desc" placeholder="Desc"></textarea>
		        <input type="text" ref="image" placeholder="URL to Image" />
		        <button type="submit">+ Add Item </button>
	     	</form>
		)
	}
});

// Header

var Header = React.createClass({
	render: function(){
		return (
		<header className="top">
			<h1>Catch <span className="ofThe"><span className="of">of</span><span className="the">the</span></span> Day</h1>
			<h3 className="tagline">{this.props.tagline}</h3>
		</header>
		)
	}
});

// Order

var Order = React.createClass({
	render: function(){
		return (
		<h1>Order</h1>
		)
	}
});

// Inventory

var Inventory = React.createClass({
	render: function(){
		return (
		<div>
		<h2>Inventory</h2>
		<AddFishForm {...this.props}></AddFishForm>
		</div>
		)
	}
});

var StorePicker = React.createClass({
	mixins: [History],
	// Store button click (on submit)
	goToStore: function(e) {
		e.preventDefault();
		// find value of store ID by pointing to the ref of the input. StoreID is an object value
		let storeId = this.refs.storeId.value;

		// Intead of window.location, use push states with the history mixin added up top.
		this.history.pushState(null, '/store/' + storeId);
	},
	render: function(){
			return (
				<form action="" className="store-selector" onSubmit={this.goToStore}>
				<h2>Enter a Store</h2>
				<input type="text" ref="storeId" required defaultValue={ helper.getFunName() }/>
				<input type="submit" />
				</form>
				)
		}
});

var NotFound = React.createClass({
	render: function(){
		return (
			<h1>Nothing Found</h1>
		)
	}
});

// Routes
// history in Router allows us to have nice URLs. Must require the package.
//
// 404 is the * path. Renders the NotFound component.

var routes = (
	<Router history={ createBrowserHistory() }>
		<Route path="/" component={ StorePicker } />
		<Route path="/store/:storeId" component={ App } />
		<Route path="*" component={ NotFound } />
	</Router>
	)

ReactDOM.render(routes, document.querySelector('#main'));