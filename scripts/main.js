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


// Firebase and Re-base  (Re-base great tool with Firebase for state changes)
var Rebase = require('re-base');
// Hook up to the DB on Firebase
var base = Rebase.createClass('https://tazc-catch-of-the-day.firebaseio.com/');

// Create Browser History (Gets rid of # in URL)
var createBrowserHistory = require('history/lib/createBrowserHistory');

// Main Unique store page
var App = React.createClass({

	// Set initial state of fishes and order objects. Default key for init state.
	// BASE REACT FRAMEWORK FUNCTION
	getInitialState: function(){
		return {
			fishes: {},
			order: {}
		}
	},

	// Runs once when App comp loads. Used to get initial data.
	// BASE REACT FRAMEWORK FUNCTION
	componentDidMount : function(){

		// Take our state and synch it with Firebase
		// this.props.params.storeId + '/fishes' stores the data in the firebase
		// url with the extension of /fishes. 
		base.syncState(this.props.params.storeId + '/fishes', {
			context: this,
			state: 'fishes'
		});
		var theStore = this.props.params.storeId;
		var localStorageReference = localStorage.getItem('order-'+theStore);

		// If local storage has something for this store
		if (localStorageReference) {
			// Update the components state to reflect what is in localStorage
			// Must parse JSON since its a JSON string.
			this.setState({
				order: JSON.parse(localStorageReference)
			})
		}
	},

	// Everytime a prop or state updates
	// BASE REACT FRAMEWORK FUNCTION
	componentWillUpdate : function(nextProp,nextState){
		console.log('next state ' , nextProp);
		var theStore = this.props.params.storeId;

		// Set in localStorage. MUST be JSON since localStorage only accepts strings.
		localStorage.setItem('order-'+ theStore, JSON.stringify(nextState.order));
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
	addToOrder: function(order){
		// Add to the state order object.
		// If that key already exists, add 1 to it. Otherwise, start it at 1.
		this.state.order[order] = this.state.order[order] + 1 || 1;

		// Be sure to change the state (rerender it) each time. 
		// Set state to the specific object you are changing.
		this.setState({ order: this.state.order })

		// MUST add to child components below via props. Fish component 'addToOrder={this.addToOrder}'
	},
	loadSamples: function(e){
		this.setState({
			fishes: require('./sample-fishes')
		});
	},
	renderEachFish : function(key){
		/*
		key is the 'fish1' passed into it. We can inject the details of each object fish key using
		bracket notation. The elements 'key' and 'index' helps us identify each element if we need
		to change it in the future.
		*/
		
		return (
		<Fish key={key} index={key} addToOrder={this.addToOrder} details={this.state.fishes[key]} ></Fish>
		)
	},
	render: function(){
		// console.log('render app', this);
		 /*
		 'Object.keys' turns the object (this.state.fishes) into an array with the key values.
		 [fish1,fish2,fish3,...]. We then map that array and run 'renderEachFish' on each array index.
		 */

		return (
			<div className="catch-of-the-day">
				<div className="menu">
					<Header tagline="Fresh Seafood Market!"></Header>
					<ul className="list-of-fishes">
						{Object.keys(this.state.fishes).map(this.renderEachFish)}
					</ul>
				</div>
				<Order fishes={this.state.fishes} order={this.state.order}></Order>
				<Inventory addFish={this.addFish} loadSamples={this.loadSamples}></Inventory>
			</div>
		)
	}
});

// Fish Component used in Fish list
// <Fish/>

var Fish = React.createClass({
	addFishToOrder : function(){

		// add fish
		// The specific fish item clicked is store in this.props.index. 
		this.props.addToOrder(this.props.index);
	},
	render: function(e){
		//console.log(this);
		var details = this.props.details;
		var isAvailable = (details.status === 'available' ? true : false);
		var buttonText = (isAvailable ? 'Add to Order' : 'Sold Out!');
		return (
			<li className="menu-fish">
			<img src={details.image} alt={details.name}/>
			<h3 className="fish-name">
			{details.name}
			<span className="price">{helper.formatPrice(details.price)}</span>
			</h3>
			<p>{details.desc}</p>
			<button disabled={!isAvailable} onClick={this.addFishToOrder} > {buttonText} </button>
			</li>
		)
	}
})

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

	// Map out the orders. Run function on each array item.
	showOrder : function(key) {
		console.log(key);
		// Get fish from fishes
		var fish = this.props.fishes[key];
		console.log(fish);
		var numOfFish = this.props.order[key];

		// Get price times the number of that fish in the order
		var price = fish.price * numOfFish;

		// If fish doesn't exist or is 0
		if (!fish || numOfFish === 0){
			return ( 
				<li key={key}>No more&nbsp;{fish.name}&nbsp;available.</li>
			)
		}

		// Show fish in order slot
		return (
			<li key={key}>
			<div>{numOfFish}&nbsp;lbs</div>
			<div>{fish.name}</div>
			<span className="price">{helper.formatPrice(price)}</span>
			</li>
		)
	},

	render: function(){
		// Get array of all the fishes in the order. Originally an object.
		var orderIds = Object.keys(this.props.order);

		// Reduce and run function on each array index to add up price.
		var total = orderIds.reduce( (prevTotal, key) => {

			// get fish
			var fish = this.props.fishes[key];
			// number of orders of that fish
			var orderCount = this.props.order[key];
			// If fish exists AND status is available
			var isAvailable = fish && fish.status === 'available';

			if (fish && isAvailable) {
				return prevTotal + (orderCount * parseInt(fish.price) || 0);
			}

			return prevTotal;

			// starting at 0
		},0);
		return (
		<div className="order-wrap">
			<h2 className="order-title">Your Order</h2>
			<ul className="order">
			{ orderIds.map( this.showOrder ) }
				<li className="total">
					<strong>Total:</strong>
					{ helper.formatPrice(total) }
				</li>
			</ul>
		</div>
		)
	}
});

// Inventory

var Inventory = React.createClass({
	render: function(){
		return (
		<div>
		<h2>Inventory</h2>
		<AddFishForm addFish={this.props.addFish}></AddFishForm>
		<button onClick={ this.props.loadSamples }>Load Sample Fishes</button>

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