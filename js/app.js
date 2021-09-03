/* VARIABLES */
const results = document.querySelector("#results");
const form = document.querySelector("#form");

/* WHEN LOADING THE PAGE */
window.onload = () => {
	form.addEventListener("submit", validateForm);
};

/* FUNCTIONS */
function validateForm(event) {
	event.preventDefault();

	actualPage = 1;

	/* SEARCH TERM AND PLACE */
	const query = document.querySelector("#query").value;
	const near = document.querySelector("#near").value;

	/* VALIDATION */
	if (query === "" || near === "") {
		showAlert("Ambos cambos son obligatorios.");
		return;
	}

	/* SEARCH PLACES */
	searchPlaces(query.trim(), near.trim());
}

function showAlert(message) {
	const existsAlert = document.querySelector(".border-l-4");

	/* CREATE AN ALERT */
	if (!existsAlert) {
		const alert = document.createElement("div");
		alert.classList.add("bg-white", "border-l-4", "border-red-400", "w-full", "mt-4", "p-4");
		alert.innerHTML = `
			<div>
				<p class="text-red-600 font-bold">Error</p>
				<p class="text-red-600 text-sm">${message}</p>
			</div>
		`;
		form.appendChild(alert);

		/* DELETE THE ALERT AFTER 3.5 SECONDS */
		setTimeout(() => {
			alert.remove();
		}, 3500);
	}
}

function searchPlaces(query, near) {
	const version = '20221231';
	const client_id = "HK00JYATOGWSIKR3EHCY4FWEO2FPAEI3QYDEITXLH3L224RI";
	const client_secret = "QGVCTDQL1D5Q5CBZEZ0ELVMUOTTAZABP1NYTCQCVMQS4AVGE";

	/*
	if (date.getMonth() + 1 < 10) {
		v = date.getFullYear() + "0" + (date.getMonth() + 1).toString() + date.getDate();
	} else {
		v = date.getFullYear() + (date.getMonth() + 1).toString() + date.getDate();
	}
	*/

	const url = `https://api.foursquare.com/v2/venues/search?near=${near}&query=${query}&client_id=${client_id}&client_secret=${client_secret}&v=${version}`;

	/* SHOW AN SPINNER */
	spinner();

	/* CONSULT THE API */
	fetch(url)
		.then(response => response.json())
		.then(result => {
			const totalVenues = result.response.venues.length;

			if (totalVenues === 0){
				showAlert("Intenta con una búsqueda en singular o con otro lugar.");
				document.querySelector(".sk-cube-grid").remove();
				return;
			}

			showPlaces(result.response.venues, result.response.geocode);
		})
		.catch(err => console.log(err));
}

function showPlaces(venues, geocode){
	cleanUpHTML();

	/* WHERE */
	const { feature: { displayName } } = geocode;

	/* ITERATE OVER THE VENUES ARRAY */
	const flexDiv = document.createElement("div");
	flexDiv.classList.add("flex", "flex-wrap", "px-4", "sm:px-8");
	const imageUrl = "https://foursquare.com/img/categories/";
	venues.forEach(venue => {
		const {
			categories,
			location: {
				formattedAddress,
				lat,
				lng
			},
			name
		} = venue;

		const prefix = categories[0]?.icon?.prefix;
		const suffix = categories[0]?.icon?.suffix;
		let category = categories[0]?.name;
		const url = dd2dms( lat.toString(), lng.toString() );
		let fullImageUrl = '../img/map.png';
		if ( prefix?.split('/')[5] !== undefined &&  suffix !== undefined){
			// fullImageUrl = imageUrl + prefix?.split('/')[5] + "/default_64" + suffix;
			fullImageUrl = imageUrl + prefix?.slice(39, -1) + "_64" + suffix;
		}

		category !== undefined ? category : category = 'Sin categoría';

		flexDiv.innerHTML += `
			<div class="my-1 p-2 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
				<article class="bg-white overflow-hidden rounded-lg shadow-lg p-4 border-solid border-2 border-blue-600">
					<header class="flex items-center justify-between leading-tight">
						<img alt="No Image" class="h-12 w-12 block rounded-full" src="${fullImageUrl}" />
						<h1 class="text-right text-2xl text-blue-700 font-bold leading-none">${name}</h1>
					</header>

					<p class="text-gray-700 text-md mt-4">${category}</p>
					<p class="text-gray-600 text-sm mb-4">${formattedAddress}</p>

					<footer class="flex flex-col items-start leading-none mt-4">
						<p class="text-md">${displayName}</p>
						<a
							class="mt-4 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
							href="https://www.google.com/maps/place/${url}"
							target="_blank"
						>
							Visitar
						</a>
					</footer>

			</article>
			<!-- END Article -->
	</div>
		`;

		
		results.appendChild(flexDiv);
	});
}

/* CONVERT LATITUDE AND LONGITUDE TO DECIMAL */
function dd2dms(ddLat, ddLong) {
	let ddLatVal = '';
	let dmsLatHem = '';

	if ( ddLat.substr(0, 1) == "-" ) {
		dmsLatHem = 'S';
		ddLatVal = ddLat.substr(1, ddLat.length - 1);
	} else {
		dmsLatHem = 'N';
		ddLatVal = ddLat;
	}
	
	let ddLongVal = '';
	let dmsLongHem = '';
	if (ddLong.substr( 0, 1 ) == "-") {
		dmsLongHem = 'W';
		ddLongVal = ddLong.substr(1, ddLong.length - 1);
	} else {
		dmsLongHem = 'E';
		ddLongVal = ddLong;
	}

	let ddLatVals = ddLatVal.split(".");
	let ddLongVals = ddLongVal.split(".");

	let ddLatRemainder = ("0." + ddLatVals[1]) * 60;
	let dmsLatMinVals = ddLatRemainder.toString().split(".");

	let ddLongRemainder = ("0." + ddLongVals[1]) * 60;
	let dmsLongMinVals = ddLongRemainder.toString().split(".");

	let ddLatMinRemainder = ("0." + dmsLatMinVals[1]) * 60;
	let ddLongMinRemainder = ("0." + dmsLongMinVals[1]) * 60;
	
	let latitude = `${ddLatVals[0]}°${dmsLatMinVals[0]}'${Math.round(ddLatMinRemainder)}''${dmsLatHem}`;
	let longitude = `${ddLongVals[0]}°${dmsLongMinVals[0]}'${Math.round(ddLongMinRemainder)}''${dmsLongHem}`;
	return `${latitude},${longitude}`;
}

/* CLEAN UP THE PREVIOUS HTML */
function cleanUpHTML(){
	while ( results.firstChild ){
		results.removeChild(results.firstChild);
	}
}

/* SHOW SPINNER */
function spinner(){
	cleanUpHTML();

	const divSpinner = document.createElement("div");
	divSpinner.classList.add("sk-cube-grid");
	divSpinner.innerHTML = `
		<div class="sk-cube sk-cube1"></div>
		<div class="sk-cube sk-cube2"></div>
		<div class="sk-cube sk-cube3"></div>
		<div class="sk-cube sk-cube4"></div>
		<div class="sk-cube sk-cube5"></div>
		<div class="sk-cube sk-cube6"></div>
		<div class="sk-cube sk-cube7"></div>
		<div class="sk-cube sk-cube8"></div>
		<div class="sk-cube sk-cube9"></div>
	`;

	results.appendChild(divSpinner);
}
