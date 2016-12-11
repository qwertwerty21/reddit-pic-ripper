( function( global, $ ){

	$(document).ready(function() {
		var socket = io();
		var $searchTermInput = $('#searchTermInput');
		var $searchTermBtn = $('#searchTermBtn');
		//var $ripImgsBtn = $('#ripImgsBtn');
		var $rippedImgContainer = $('.ripped-img-container')
		console.log('yoyo')

		$searchTermInput.on('keydown', function(e){
			if( e.which === 13 ){
				$searchTermBtn.click();
			}
		});
		
		$searchTermBtn.on('click', function(e){
			e.preventDefault();
			if($searchTermInput.val() !== ""){
				socket.emit('make a search', {
					searchTerm: $searchTermInput.val()
				})
				$searchTermInput.val('');
			}
			else{
				alert('Type a search term!');
			}
		});


		function displayImg( url ){
			var $imgRipLink = $('<a>',{
				'href': url,
				'download': 'rippedImg.jpg'
			});
			var $imgurImg = $('<img>',{
				"class": "imgur-img col-md-2 col-sm-4 col-xs-6 img-responsive",
				"src": url
			});

			
			$imgRipLink.append($imgurImg);
			$rippedImgContainer.append($imgRipLink);
		}

		socket.on('return search results', function(urls){
			console.log(urls)
			//empty container
			$rippedImgContainer.empty();
			//alert if no urls are returned
			if(urls.length === 0){
				alert('Your search turned up 0 results! Try a different subreddit?');
				$searchTermInput.val('');
			}
			else{
				//var zip = new JSZip();
				//var imgFolder = zip.folder("imgs");
				//populate 
				for(var i = 0; i < urls.length; i++){
					//imgFolder.file(i, urls[i]);
					displayImg(urls[i])
				}
				/*var content = zip.generateAsync({type:"blob"})
					.then(function(content){
						saveAs(content, 'rippedPics.zip')
					}, function(err){
						console.log(err)
					});*/
				
			}
			
			
		});
	});
})( window, jQuery );