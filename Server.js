/*var NWmap = [];*/

var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , mysql = require('mysql');
server.listen(8080);

var sqlConnection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'zelda18',
});

app.get('/', function (req, res) {
  //res.sendfile(__dirname + '/index.html');
});

var chatbox = '/chat';
var chat = io
    .of(chatbox)
	.on('connection', function (socket) {
	console.log('connected to chat');
    // socket.emit('news', { hello: 'world' });
       socket.on('chat', function (data) {
            var player = data.playerID; // extract data from the input stream
			var said = data.said;
			var string = player + " : " + said; 
	        console.log(string);
			chat.emit('message',{message:string,GameID:data.GameID}); // send a chat to everyone connected to chat
        });
    });

var game = io // use game to send to all, broadcast for new units,
    .of('/game')
	.on('connection', function (socket) {
		socket.on('joiningGame',function(data){
			var TEST_DATABASE = 'users';
			var TEST_TABLE = 'user_games';
			sqlConnection.query('USE '+TEST_DATABASE);
			sqlConnection.query('SELECT * FROM '+TEST_TABLE+' WHERE GameID = '+data.GameID+' AND Username = "'+data.Username+'" ', function(err, results) {
				if (err) {
				console.log('error in joining Game after Query Select * ' + data.GameID);
				//throw err;
				}
				else{
					if(results.length === 1) // I alreadly exist in this game, just download my shit.
					{  
						console.log('  I already exist, just download the game files  ');
						socket.emit('joiningGameReply',{reply:true});				
						//socket.emit('joingingGameReply',{answer:1});// send response only to this socket, all the games data
					}
					else if(results.length === 0){//add the user to the game.
						sqlConnection.query('INSERT INTO user_games VALUES ("'+data.Username+'" , "'+data.GameID+'") ', function(err, results) {
							if(err){
								console.log('error erroe in joining game insert');
							}
							else{ // also need to add a new city for this new player
							
							//need to broadcast to all the other sokcets that a new player has joined the game   #####################################################
							
								sqlConnection.query('SELECT * FROM constructs WHERE GameID ='+data.GameID+' AND type = 11 ', function(err, results) { // pull all the cities for this game
									if(err){console.log('error in new city insert');}
									else{
										var x =0;
										var y = 0;
										var name = 0;
										if(results.length === 0){
											//first city
											x = 8;
											y = 5;
											name = "troy";
										}else if(results.length === 1){
											//first city
											var x = 8;
											var y = 18;
											var name = "troy2";
										}else if(results.length === 2){
											//first city
											var x = 8;
											var y = 34;
											var name = "troy3";
										}else if(results.length === 3){
											//first city
											var x = 28;
											var y = 6;
											var name = "troy4";
										}else if(results.length === 4){
											//first city
											var x = 28;
											var y = 18;
											var name = "troy5";
										}else if(results.length === 5){
											//first city
											var x = 28;
											var y = 34;
											var name = "troy6";
										}else{
											console.log('too many players');
										}
										
										var TEST_DATABASE = 'users';
										var TEST_TABLE = 'constructs'; // new table
										sqlConnection.query('USE '+TEST_DATABASE);
										sqlConnection.query('INSERT INTO '+TEST_TABLE+' VALUES ("'+x+'","' +y +'","'+ name+'","'+11+'","' +1+'","'+0+'","' +0+'","'+data.Username+'","'+data.GameID+'","' + null+'" ) ', function(err, results) { // add the new city
											if (err) {
												console.log('error in Insert newConstructData');
											} // city has been added, player can start to download data
											else{
												console.log('  I did not exist, inserted new city  ');//debug
												sqlConnection.query('SELECT * FROM constructs WHERE GameID ='+data.GameID+' AND type = 11 AND Username = "'+data.Username+'" ', function(err, construct) { //there should be only one city associated to this player at this point
													if(err){console.log('error in select constructs in joining game')}
													else{
														var distance = 3 +(2 * construct[0].upgrade1);
														//console.log('distance = ' + distance);//debug
														for(var j = 0; j < distance; j++) // start a double loop to go through all the tiles affected by the object ZOI, call check owner on the tile with the mapObjects owner to find conflict points
														{
															for(var k = 0; k < distance;k++ ) //
															{
																//console.log('j: '+ j + ' K: '+k);//debug
																/*var jj = 1 - construct[0].upgrade1;
																console.log('jj1:'+jj);
																jj += j;
																console.log('jj2:'+jj);
																jj = construct[0].mapX - jj;
																console.log('jj3:'+jj);*/ // debug
																//console.log('called tile X: '+(construct[0].mapX -((1+construct[0].upgrade1)+j))+ ' Y: '+ (construct[0].mapY -((1-construct[0].upgrade1)+k)) );//debug
																addTile(((construct[0].mapX -(1+construct[0].upgrade1))+j),((construct[0].mapY -(1+construct[0].upgrade1))+k),construct);
															}
														}
														
														// I should add in the buildings here
														sqlConnection.query('INSERT INTO city_upgrades VALUES ('+construct[0].ID+',0,0,0,0,0)', function(err, resultaa) { // add the new city
															if(err){console.log('error in insert city fr building info into user');}
															else{ // the new resources should have been added now
																
																//socket.emit('joiningGameReply',{reply:true});// send response only to this socket
															}
														});
														
													}
													//also need to add in the starting base resources#
													
													sqlConnection.query('INSERT INTO user_resources VALUES ("'+data.Username+'","' +data.GameID+'",1,1000),("'+data.Username+'","' +data.GameID+'",2,1000),("'+data.Username+'","' +data.GameID+'",3,1000),("'+data.Username+'","' +data.GameID+'",4,1000),("'+data.Username+'","' +data.GameID+'",5,1002) ', function(err, results) { // add the new city
														if(err){console.log('error in insert resources into user');}
														else{ // the new resources should have been added now
															
															socket.emit('joiningGameReply',{reply:true});// send response only to this socket
														}
													});
													
												});
												// also need to broad cast the new city to all the existing players       ##################################
												
											}
										});
									}	
								});	
							}
								//socket.emit('isGameSetupReply',{answer:true});
						});
					}
					else{
						// if I am here, that is very bad
						console.log('Should never see this message in joining game');//debug
					}
				}
				// socket.emit('retuLogIn',results[0]['name']);
			});
			
		});
		socket.on('isGameSetup',function(data){ // will add a new game if the game does not exist
			var TEST_DATABASE = 'users';
			var TEST_TABLE = 'games';
			if(data.GameID == 0){
			console.log('I know thw game is = to one');
				// need to create new create a new game
				sqlConnection.query('USE '+TEST_DATABASE);
				sqlConnection.query('SELECT GameID FROM '+TEST_TABLE+' ORDER BY GameID DESC ', function(err, results) {
					if (err) {
						console.log('error in isGameSetup after Query Select * ' + data.GameID);
					//throw err;
					}
					else{
						var game = 1;
						//console.log(results[0]); // [{1: 1}]
						if(results.length != 0) //no games, create a new one
						{  
							
							game = results[0].GameID;
							game++;
							//socket.emit('isGameSetupReply',{answer:true});// send response only to this socket, all the games data
						}
						
							sqlConnection.query('INSERT INTO games VALUES ("'+game+'","map1") ', function(err, result) {
							if(err){
								console.log('error in insert at new game in isgamesetup');
							}
							else{
								socket.emit('isGameSetupReply',{GameID:game});// send response only to this socket, all the games data
							}
							});
						
					}
					// socket.emit('retuLogIn',results[0]['name']);
				});
			}
			else{
				
				sqlConnection.query('USE '+TEST_DATABASE);
				sqlConnection.query('SELECT * FROM '+TEST_TABLE+' WHERE GameID ='+data.GameID+' ', function(err, results) {
					if (err) {
					console.log('error in isGameSetup after Query Select * ' + data.GameID);
					//throw err;
					}
					//console.log(results[0]); // [{1: 1}]
					if(results.length === 1) // game exists
					{  
						socket.emit('isGameSetupReply',{GameID:data.GameID});// send response only to this socket, all the games data
					}
					else{//create the game
						sqlConnection.query('INSERT INTO games VALUES ("'+data.GameID+'", map1") ', function(err, results) {
							socket.emit('isGameSetupReply',{GameID:data.GameID});// send response only to this socket, all the games data
						});
					}
					// socket.emit('retuLogIn',results[0]['name']);
				});
			}
			
		});
		socket.on('getPlayerData',function(data){
			var TEST_DATABASE = 'users';
			var TEST_TABLE = 'user_games';
			sqlConnection.query('USE '+TEST_DATABASE);
			sqlConnection.query('SELECT * FROM '+TEST_TABLE+' WHERE GameID ='+data.GameID+' ', function(err, results) {
				if (err) {
				console.log('error in getPlayerData after Query Select * ' + data.GameID);
				//throw err;
				}
				//console.log(results[0]); // [{1: 1}]
				if(results.length != 0) // > 0
				{  
					var array = [];
					var array2 = [];
					var game = results[0]['GameID'];
					array.push({'GameID': game});
					//array
					for(var i = 0; i < results.length;i++){
						var reply = results[i];
							array.push({'player':reply['Username']});
					}
					array2.push({gameData:array});
					socket.emit('getPlayerDataReply',array2);// send response only to this socket, all the games data
				}
				// socket.emit('retuLogIn',results[0]['name']);
			});
			
		});
		
		socket.on('getConstructData',function(data){
			var TEST_DATABASE = 'users';
			var TEST_TABLE = 'constructs'; // new table
			sqlConnection.query('USE '+TEST_DATABASE);
			sqlConnection.query('SELECT * FROM '+TEST_TABLE+' WHERE GameID ='+data.GameID+'', function(err, results) {
				if (err) {
				console.log('error in getConstructData after Query Select * ' + data.GameID);
				//throw err;
				}
				//console.log(results[0]); // [{1: 1}]
				if(results.length != 0) // > 0
				{  
					var finished = false;
					for(var i = 0; i < results.length;i++){
						var reply = results[i];
						console.log(reply['GameID']);
						if(i+1 >= results.length){finished = true;}
						socket.emit('getConstructDataReply',{'gameData': [{'mapX': reply['mapX'], 'mapY': reply['mapY'], 'name': reply['name'],'type': reply['type'], 'ZOI': reply['upgrade1'],'up2': reply['upgrade2'], 'up3': reply['upgrade3'],'PlayerID': reply['Username'],'GameID': reply['GameID'],'ID':reply['ID'],'finished': finished}]});// send response only to this socket
					}// do not need this here because, it only needs to be called once.
					//socket.emit('getPlayerDataReply',{'finished': 'true'}); // to let the game know to progress to the next resource
				}
				else{
					console.log("Fail, length == 0 0" + data.GameID + "  " ); // did not find a match
				}
				// socket.emit('retuLogIn',results[0]['name']);
			});
			
		});
		
		socket.on('getUnitsData',function(data){
			var TEST_DATABASE = 'users';
			var TEST_TABLE = 'units'; // new table
			sqlConnection.query('USE '+TEST_DATABASE);
			sqlConnection.query('SELECT * FROM '+TEST_TABLE+' WHERE GameID ='+data.GameID+'', function(err, results) {
				if (err) {
				console.log('error in getUnitData after Query Select * ' + data.GameID);
				//throw err;
				}
				//console.log(results[0]); // [{1: 1}]
				if(results.length != 0) // > 0
				{  
					var finished = false;
					for(var i = 0; i < results.length;i++){
						var reply = results[i];
						console.log(reply['GameID']);
						if(i+1 >= results.length){finished = true;}
						socket.emit('getUnitsDataReply',{'gameData': [{'mapX': reply['mapX'], 'mapY': reply['mapY'], 'name': reply['name'],'type': reply['type'], 'qty': reply['qty'],'tarX': reply['targetX'], 'tarY': reply['targetY'],'PlayerID': reply['Username'],'GameID': reply['GameID'],'ID':reply['ID'],'finished': finished}]});// send response only to this socket
					}// do not need this here because, it only needs to be called once.
					//socket.emit('getPlayerDataReply',{'finished': 'true'}); // to let the game know to progress to the next resource
				}
				else{
					socket.emit('getUnitsDataReply2',{reply:false});
					console.log("length == 0 no units in the game yet"); // did not find a match
				}
				// socket.emit('retuLogIn',results[0]['name']);
			});
			
		});
		
		socket.on('newUnitData',function(data){
			var TEST_DATABASE = 'users';
			var TEST_TABLE = 'units'; // new table
			sqlConnection.query('USE '+TEST_DATABASE);
			sqlConnection.query('INSERT INTO '+TEST_TABLE+' VALUES ("'+data.mapX+'","' +data.mapY +'","'+ data.name+'","'+data.type+'","' +data.qty+'","'+data.tarX+'","' +data.tarY+'","'+data.PlayerID+'","'+data.GameID+'","' + null+'" ) ', function(err, results) {
					if (err) {
						console.log('error in Insert newUnitData');
					}
					else{
					//call back the table, emit to all other players new unit, send ID back to emiting socket
						sqlConnection.query('SELECT * FROM '+TEST_TABLE+' ORDER BY id DESC', function(err, result) {// this should select the last entry into the table
							if (err) {
								console.log('error in select after insert in newUnitData');
							}
							else{
							//console.log(results[0]); // [{1: 1}]
								var finished = false;
								var reply = result[0];
								console.log(reply['GameID']);
								game.emit('newUnitDataReply',{'gameData': [{'mapX': reply['mapX'], 'mapY': reply['mapY'], 'name': reply['name'],'type': reply['type'], 'qty': reply['qty'],'tarX': reply['targetX'], 'tarY': reply['targetY'],'PlayerID': reply['Username'],'GameID': reply['GameID'],'ID':reply['ID'],'finished': finished}]}); // everyone connected to game should get this emit
							}
						});
					}
				// socket.emit('retuLogIn',results[0]['name']);
			});
		});
		
		socket.on('newConstructData',function(data){
			var TEST_DATABASE = 'users';
			var TEST_TABLE = 'constructs'; // new table
			sqlConnection.query('USE '+TEST_DATABASE);
			sqlConnection.query('INSERT INTO '+TEST_TABLE+' VALUES ("'+data.mapX+'","' +data.mapY +'","'+ data.name+'","'+data.type+'","' +data.up1+'","'+data.up2+'","' +data.up3+'","'+data.PlayerID+'","'+data.GameID+'","' + null+'" ) ', function(err, results) {
					if (err) {
						console.log('error in Insert newConstructData');
					}
					else{
					//call back the table, emit to all other players new unit, send ID back to emiting socket
						sqlConnection.query('SELECT * FROM '+TEST_TABLE+' WHERE GameID = "'+data.GameID+'" ORDER BY id DESC', function(err, result) {//should add limit 1 after desc
							if (err) {
								console.log('error in select after insert in newConstructData');
							}
							else{
							//console.log(results[0]); // [{1: 1}]
								var finished = false; // testing this, was false
								var reply = result[0];
								console.log(reply['GameID']);
								game.emit('newConstructDataReply',{'gameData': [{'mapX': reply['mapX'], 'mapY': reply['mapY'], 'name': reply['name'],'type': reply['type'], 'ZOI': reply['upgrade1'],'up2': reply['upgrade2'], 'up3': reply['upgrade3'],'PlayerID': reply['Username'],'GameID': reply['GameID'],'ID':reply['ID'],'finished': finished}]});// send response only to this socket
								
								sqlConnection.query('SELECT * FROM constructs WHERE ID ='+reply['ID']+' ', function(err, construct) { //there should be only one city associated to this player at this point
									if(err){console.log('error in select constructs in joining game')}
									else{
										var distance = 3 +(2 * construct[0].upgrade1);
										//console.log('distance = ' + distance);//debug
										for(var j = 0; j < distance; j++) // start a double loop to go through all the tiles affected by the object ZOI, call check owner on the tile with the mapObjects owner to find conflict points
										{
											for(var k = 0; k < distance;k++ ) //
											{
												addTile(((construct[0].mapX -(1+construct[0].upgrade1))+j),((construct[0].mapY -(1+construct[0].upgrade1))+k),construct);
											}
										}
									}
									//also need to add in the starting base resources#
								});
							}
						});
					}
				// socket.emit('retuLogIn',results[0]['name']);
			});
		});
		socket.on('updateUnitMovement',function(data){
		var TEST_DATABASE = 'users';
		var TEST_TABLE = 'units'; // new table
		sqlConnection.query('USE '+TEST_DATABASE);
			sqlConnection.query('UPDATE '+TEST_TABLE+' SET targetX='+data.targetX+', targetY='+data.targetY+' WHERE id='+data.ID+'', function(err, results) {
				if (err) {
					console.log('error in update updateUnitMovement');
				}
				else{ // should be no result
					console.log('unitmovement have been updated');
					//call back the table, emit to all other players new unit, send ID back to emiting socket
				}
				// socket.emit('retuLogIn',results[0]['name']);
			});
		});
		socket.on('getResources',function(data){
		var TEST_DATABASE = 'users';
		//var TEST_TABLE = 'resources'; // new table
		sqlConnection.query('USE '+TEST_DATABASE);			// unknown error has forced my hand to create a for loop to find the user
		sqlConnection.query('SELECT * FROM user_resources WHERE GameID ='+data.GameID+' AND Username ="'+data.PlayerID+'" ORDER BY Type', function(err, results) {// WHERE GameID ='+data.GameID+' AND PlayerID ='+ data.PlayerID +''
				if (err) {
					console.log('error in get resources after select query ' + data.GameID+ '  '+ data.PlayerID );
				}
				else{ // should be no result
					if(results.length != 0) // > 0
					{  
						var array = [];
						for(var i = 0; i < results.length;i++){
							var reply = results[i];
							array.push({'res':reply['Volume'],'type':reply['Type']});
						}
						socket.emit('getResourcesReply',array);// send response only to this socket
					}
			}
			// socket.emit('retuLogIn',results[0]['name']);
		});
	});
		socket.on('updateResources',function(data){
			var TEST_DATABASE = 'users';
			var TEST_TABLE = 'resources'; // new table
			sqlConnection.query('USE '+TEST_DATABASE);
				sqlConnection.query('UPDATE '+TEST_TABLE+' SET resource1='+data.res1+', resource2='+data.res2+', resource3='+data.res3+', resource4='+data.res4+', resource5='+data.res5+' WHERE Username="'+data.PlayerID+'" AND GameID='+data.GameID+'', function(err, results) {
					if (err) {
						console.log('error in update resources');
					}
					else{ // should be no result
						console.log('resources Updateded for ' + data.PlayerID);
						//call back the table, emit to all other players new unit, send ID back to emiting socket
					}
					// socket.emit('retuLogIn',results[0]['name']);
				});
			});
		socket.on('newResourceUpdates',function(data){
			var TEST_DATABASE = 'users';
			var TEST_TABLE = 'resourceUpdates'; // new table
			sqlConnection.query('USE '+TEST_DATABASE);
				sqlConnection.query('UPDATE '+TEST_TABLE+' SET res1='+data.res1+', res2='+data.res2+', res3='+data.res3+', res4='+data.res4+', res5='+data.res5+' WHERE Username="'+data.PlayerID+'" AND GameID='+data.GameID+' AND ID = '+data.ID+'', function(err, results) {
					if (err) {
						console.log('error in new resources');
					}
					else{ // should be no result
						console.log('newresourcesUpdateded for ' + data.PlayerID);
						//call back the table, emit to all other players new unit, send ID back to emiting socket
					}
					// socket.emit('retuLogIn',results[0]['name']);
				});
			});
		socket.on('newResourceCP',function(data){
			var TEST_DATABASE = 'users';
			var TEST_TABLE = 'resourceUpdates'; // new table
			sqlConnection.query('USE '+TEST_DATABASE);
			sqlConnection.query('INSERT INTO '+TEST_TABLE+' VALUES ("'+data.res1+'","' +data.res2 +'","'+ data.res3+'","'+data.res4+'","' +data.res5+'","'+data.ID+'","'+data.GameID+'","'+data.PlayerID+'") ', function(err, results) {
					if (err) {
						console.log('error in Insert newResourceCP');
					}
					else{
					//call back the table, emit to all other players new unit, send ID back to emiting socket
						console.log('newresourceUpdates completed for ' + data.PlayerID);
					}
				// socket.emit('retuLogIn',results[0]['name']);
			});
		});
		socket.on('addTile',function(data){
			var TEST_DATABASE = 'users';
			var TEST_TABLE = 'map1'; // new table
			sqlConnection.query('USE '+TEST_DATABASE);
			sqlConnection.query('INSERT INTO '+TEST_TABLE+' VALUES ("'+data.mapX+'","'+data.mapY+'","'+data.type+'","'+data.Volume+'","'+null+'" ) ', function(err, results) {
					if (err) {
						console.log('error in Insert Map1'+ data.mapX+' y:' + data.mapY +' type: '+data.type+' volume: '+data.Volume);
					}
					else{
					//call back the table, emit to all other players new unit, send ID back to emiting socket
						console.log('map updated X:'+ data.mapX+' y:' + data.mapY );
					}
				// socket.emit('retuLogIn',results[0]['name']);
			});
		});
		socket.on('repairUnitData', function(data){
			// update the database
			//emit update to all players
			sqlConnection.query('USE users');
			sqlConnection.query('UPDATE units SET qty='+data.qty+' WHERE ID='+data.ID+'', function(err, results) {
				if (err) {
					console.log('error in update units in repair unit');
					//throw err;
				}else{
					game.emit('repairUnitDataReply',{'gameData': [{'mapX':data.mapX, 'mapY':data.mapY,'GameID': data.GameID,'ID':data.ID}]}); // everyone connected to game should get this emit
				}
			});
		});
		socket.on('sendTrade',function(data){
			sqlConnection.query('USE users');
			sqlConnection.query('UPDATE user_resources SET Volume =Volume -'+data.tradeValue+' WHERE Type='+data.tradeType+' AND Username = "'+data.trader+'" AND GameID = '+data.GameID+'', function(err, results) {
				if(err){
						console.log('error in update function sendTrade trader');
				}
				else{
					// update the other user with the resources
					sqlConnection.query('UPDATE user_resources SET Volume =Volume +'+data.tradeValue+' WHERE Type='+data.tradeType+' AND Username = "'+data.tradee+'" AND GameID = '+data.GameID+' ', function(err, results) {
						if(err){
							console.log('error in update function sendTrade trader');
						}
						else{
							// update the other user with the resources
							console.log('trade gone through from '+data.trader+' to '+data.tradee);
							socket.emit('sendTradeReply',{message:'trade gone through from '+data.trader+' to '+data.tradee});
							sqlConnection.query('SELECT * FROM user_resources WHERE GameID ='+data.GameID+' AND Username ="'+data.trader+'" ORDER BY Type', function(err, results) {// WHERE GameID ='+data.GameID+' AND PlayerID ='+ data.PlayerID +''
								if (err) {
									console.log('error in get resources after select query ' + data.GameID+ '  '+ data.PlayerID );
								}
								else{ // should be no result
									if(results.length != 0) // > 0
									{  
										var array = [];
										for(var i = 0; i < results.length;i++){
											var reply = results[i];
											array.push({'res':reply['Volume'],'type':reply['Type']});
										}
										socket.emit('getResourcesReply',array);// send response only to this socket
									}
								}
							});
							// socket.emit('retuLogIn',results[0]['name']);
						}
					});
				}
			});
		});
		socket.on('getCityData',function(data){
			sqlConnection.query('USE users');
			sqlConnection.query('SELECT * FROM city_upgrades WHERE ID ='+data.ID+'', function(err, results) {
				if (err) {
				console.log('error in getCityData after Query Select * ' + data.ID);
				//throw err;
				}
				else{
					//console.log("######################################### : " + data.ID + "  Results length: "+results[0].ID);
					socket.emit('getCityDataReply',{'ID':results[0].ID,'up1':results[0].upgrade1,'up2':results[0].upgrade2,'up3':results[0].upgrade3,'up4':results[0].upgrade4,'up5':results[0].upgrade5});
				}
			});
		});
		socket.on('instantKill',function(data){
			console.log("##########################got a request to kill someone !!!");
			sqlConnection.query('USE Users');
			sqlConnection.query('SELECT * FROM units WHERE ID ='+data.ID+'', function(err, result) {
				if(err){
					console.log("error in the instant kill select");
				}
				else{
					var results = result[0];
					sqlConnection.query('DELETE FROM units WHERE ID = '+data.ID+' ', function(err, r) {
						if(err){
							console.log('oh shit son');
						}
						else{
							game.emit('removeUnit',{mapX:results.mapX,mapY:results.mapY,qty:results.qty,GameID:results.GameID,PlayerID:results.Username, ID:results.ID});
						}
					});
				}
			});
		});
	//socket.on('chat', function (data) {
    //var info = data.said;
	console.log('connected to game');
 // });
	});

var login = io
	.of('/login')
	.on('connection', function(socket){
	console.log('connected to login');
		socket.on('loginRequest',function(data){
			var username = data.Username;
			var password = data.Password;
			//console.log(username + "  " + password);
			
			var TEST_DATABASE = 'users';
			var TEST_TABLE = 'userdetails';
			sqlConnection.query('USE '+TEST_DATABASE);
			sqlConnection.query('SELECT Username FROM '+TEST_TABLE+' WHERE Username = "'+username+'" AND Password = "'+password+'"', function(err, results) {
				if (err) {
				console.log('error in loginRequest after Query');
				//throw err;
				}
				//console.log(results[0]); // [{1: 1}]
				if(results.length === 1) // > 0
				{  
					var reply = results[0];
					console.log(reply['Username']);
					socket.emit('loginReply',{'Username': reply['Username']});// send response only to this socket
				}
				else{
					console.log("Fail"); // did not find a match
				}
				// socket.emit('retuLogIn',results[0]['name']);
			});
			//connect to database and validate
			//send response to client
			//socket.emit('loginReply',data); // send response only to this socket
			//done
		});
		
		socket.on('registerRequest',function(data){
			var username = data.Username;
			var password = data.Password;
			var email = data.Email;
			//console.log(username + "  " + password);
			console.log('got register request ' + email);
			var TEST_DATABASE = 'users';
			var TEST_TABLE = 'userdetails';
			sqlConnection.query('USE '+TEST_DATABASE);
			sqlConnection.query('SELECT Username FROM '+TEST_TABLE+' WHERE Username = "'+username+'"', function(err, results) {
			if (err) {
				console.log('error in SelectRequest before Insert');
			}
			//console.log(results[0]); // [{1: 1}]
			if(results.length === 0) // not already in the table so continue
			{  
				sqlConnection.query('INSERT INTO '+TEST_TABLE+' VALUES ("'+username+'","'+password+'","'+ email+'" ) ', function(err, results) {
					if (err) {
						console.log('error in Insert Request after Query');
						//throw err;
					}
					sqlConnection.query('SELECT Username FROM '+TEST_TABLE+' WHERE Username = "'+username+'" AND Password = "'+password+'"', function(err, results) {
						if (err) {
							console.log('error in SelectRequest after Insert');
						}
						//console.log(results[0]); // [{1: 1}]
						if(results.length === 1) // > 0
						{  
							var reply = results[0];
							console.log(reply['Username']);
							socket.emit('loginReply',{'Username': reply['Username']});// send response only to this socket
						}
						else{
							console.log("Fail"); // did not find a match
						}
					});
				});
			}
			else{
				console.log("entry already exists");
			}
			});
		// add users to database
		// use loginRply as above, no need for a new one
		});
		
		socket.on('getGames',function(){
			var TEST_DATABASE = 'users';
			var TEST_TABLE = 'user_games';
			sqlConnection.query('USE '+TEST_DATABASE);
			sqlConnection.query('SELECT * FROM '+TEST_TABLE+' ORDER BY GameID', function(err, results) {
				if (err) {
				console.log('error in getGames after Query Select *');
				//throw err;
				}
				console.log(results.length); // [{1: 1}]
				if(results.length != 0) // > 0
				{  
					var array = [];
					var array2 = [];
					var game = results[0]['GameID'];
					array.push({'GameID': game});
					//array
					for(var i = 0; i < results.length;i++){
						var reply = results[i];
						if(game === reply['GameID']){
							array.push({'player':reply['Username']});
						}
						else{
							game = reply['GameID'];
							array2.push({gameData:array});
							array = [];// reset
							array.push({'GameID':game});
							array.push({'player':reply['Username']});
						}
					}
					array2.push({gameData:array});
					socket.emit('getGamesReply',array2);// send response only to this socket, all the games data
				}
				else{
					console.log("Fail, length == 0"); // did not find a match
				}
				// socket.emit('retuLogIn',results[0]['name']);
			});
			//connect to database and validate
			//send response to client
			//socket.emit('loginReply',data); // send response only to this socket
			//done
		});
		
		socket.on('newGameRequest',function(data){
			var username = data.Username;
			var password = data.Password;
			//console.log(username + "  " + password);
			
			var TEST_DATABASE = 'users';
			var TEST_TABLE = 'userdetails';
			sqlConnection.query('USE '+TEST_DATABASE);
			sqlConnection.query('SELECT Username FROM '+TEST_TABLE+' WHERE Username = "'+username+'" AND Password = "'+password+'"', function(err, results) {
				if (err) {
				console.log('error in loginRequest after Query');
				//throw err;
				}
				//console.log(results[0]); // [{1: 1}]
				if(results.length === 1) // > 0
				{  
					var reply = results[0];
					console.log(reply['Username']);
					socket.emit('loginReply',{'Username': reply['Username']});// send response only to this socket
				}
				else{
					console.log("Fail"); // did not find a match
				}
				// socket.emit('retuLogIn',results[0]['name']);
			});
			//connect to database and validate
			//send response to client
			//socket.emit('loginReply',data); // send response only to this socket
			//done
		});
		
		
	});//end off login

var database = 'users';
var table = 'units'; // new table
var units = [];
var constructs = [];
setInterval(function(){ // troopMovement
	var table = 'units'; // new table
	sqlConnection.query('USE '+database);
	sqlConnection.query('SELECT * FROM '+table+' WHERE mapX <> targetX OR mapY <> targetY', function(err, results) { // pull all the units from the database
		if (err) {
			console.log('error in select in unitmovement interval');
		}
		else {
			for(var i = 0; i < results.length ;i++){ // > 0
			console.log('length number: ' + i);
				//var reply = results[i];
				var mapX = results[i]['mapX'];
				var tarX = results[i]['targetX'];
				var mapY = results[i]['mapY'];
				var tarY = results[i]['targetY'];
				console.log('tarY : '+tarY );
				var xDiff = 0
				var yDiff = 0;
				if(mapX != tarX){ // need to move right
					if(mapX > tarX){xDiff = mapX - tarX;mapX--; }else{xDiff = (mapX - tarX)*-1; mapX++;}
					console.log('unit '+ results[i]['name']+' needs to move X axis');
					// move in x Direction, update database, emit to all players of units new position
				}
				if(mapY != tarY){ // need to move right
					if(mapY > tarY){yDiff = mapY - tarY; mapY--;}else{yDiff = (mapY - tarY)*-1; mapY++;}
					console.log('unit '+ results[i]['name']+' needs to move Y axis');
				}
				if(xDiff >= yDiff){ //move xAxis
					mapY = results[i]['mapY']; // reset these values, so I dont have to write out the whole query twice in the code
				}else{
					//move Yaxis
					mapX = results[i]['mapX'];
				}
				console.log('new call');
				troopMovement(mapX,mapY,results[i]);
			}
		}
	});
},1000);//everysecond
	
function troopMovement(mapX,mapY,results){
	sqlConnection.query('SELECT * FROM constructs WHERE mapX = '+mapX+' AND mapY ='+mapY+' AND GameID = '+results['GameID']+'', function(err, result) { // pull all the units from the database
		if (err) {
			console.log('error in select constructs in unit movement Interval');
			//throw err;
		}
		else if(result.length > 0){
			var construct = result[0];
			if(construct.Username === results.Username){// your construct
				//add unit, update database
				sqlConnection.query('UPDATE units SET mapX='+mapX+', mapY='+mapY+' WHERE id='+results['ID']+'', function(err, results) {
				if (err) {
					console.log('error in update units in unit movement Interval');
					//throw err;
				}});
				game.emit('unitPositionUpdate',{'gameData': [{'mapX': results['mapX'], 'mapY':results['mapY'],'targetX':mapX,'targetY':mapY,'PlayerID': results['Username'],'GameID': results['GameID'],'ID':results['ID'],'finished': false}]}); // everyone connected to game should get this emit
			}
			else{// enemy or ally Attack!!!
				//is it an ally?
				sqlConnection.query('SELECT * FROM units WHERE mapX = '+mapX+' AND mapY ='+mapY+' AND GameID = '+results['GameID']+'', function(err, res) { // pull all the units from the database
				if(err){
					//fightBattle(results,result[0]);
				}
				else{
					if(res.length > 0){ // garrison
						fightBattle(results,res[0],false,true);
					}
					else{ // no troops, destroy it
						if(result[0].type == 11){ // city, need to change ownership
							sqlConnection.query('UPDATE constructs SET Username = "'+results['Username']+'" WHERE ID = '+result[0].ID+' ', function(err, rrr) {
								if (err) {
									console.log('error in update ownership in unit movement Interval');
									//throw err;
								}
								else{
									game.emit('unitOwnerShip',{'mapX': result[0].mapX, 'mapY':result[0].mapY,'PlayerID': results['Username'],'GameID': results['GameID'],'ID':result[0].ID }); // everyone connected to game should get this emit
									sqlConnection.query('UPDATE units SET mapX='+mapX+', mapY='+mapY+' WHERE id='+results['ID']+'', function(err, results) {
									if (err) {
										console.log('error in update units in unit movement Interval');
										//throw err;
									}});
									game.emit('unitPositionUpdate',{'gameData': [{'mapX': results['mapX'], 'mapY':results['mapY'],'targetX':mapX,'targetY':mapY,'PlayerID': results['Username'],'GameID': results['GameID'],'ID':results['ID'],'finished': false}]}); // everyone connected to game should get this emit
								}
							});
						}
						else{ // not a city and can be destroyed
							sqlConnection.query('DELETE FROM constructs WHERE ID = '+result[0].ID+' ', function(err, r) {		// remove it from the construct database
								if(err){console.log('error in delete in troop movement, del construct');
								}
								else{
									sqlConnection.query('DELETE FROM rcp_resources WHERE RCP_ID = '+result[0].ID+' ', function(err, rr) {// remove it from the resource table
										if(err){console.log('error in delete in troop movement, del from rcp_res');}
										else{
											// notify the user of the removal, so remove it from the client side
											game.emit('constructDestroyed',{'mapX': result[0].mapX, 'mapY':result[0].mapY,'PlayerID': result[0].Username,'GameID': result[0].GameID,'ID':result[0].ID}); // everyone connected to game should get this emit
										}
									});
								}
							});
						}
					}
				}
				});
				//create battle
			}
			// space is occupied by a construct
			//is it mine, if so enter, otherwise attack
		}
		else{// sql call for units
			sqlConnection.query('SELECT * FROM units WHERE mapX = '+mapX+' AND mapY ='+mapY+' AND GameID = '+results['GameID']+'', function(err, result2) { // pull all the units from the database
				if (err) {
					console.log('error in select units in unit movement Interval');
					//throw err;
				}
				else if(result2.length > 0){// found a unit
					var unit = result2[0];
					if(unit.Username === results['Username']){// your unit
						//do nothing
					}
					else{// enemy or ally Attack!!!
						fightBattle(results,unit,false,false);
						//create battle
					}
				// space is occupied by a construct
				//is it mine, if so enter, otherwise attack
				}
				else{ // nothing in your way, update database, emit to all players of the unit change
					// add time for squares
					sqlConnection.query('UPDATE units SET mapX='+mapX+', mapY='+mapY+' WHERE ID='+results['ID']+'', function(err, rapus) {
					if (err) {
						console.log('error in update units in unit movement Interval');
						//throw err;
					}});
					console.log('unit '+ results['name']+' needs to move before emiting');
					game.emit('unitPositionUpdate',{'gameData': [{'mapX': results['mapX'], 'mapY':results['mapY'],'targetX':mapX,'targetY':mapY,'PlayerID': results['Username'],'GameID': results['GameID'],'ID':results['ID'],'finished': false}]}); // everyone connected to game should get this emit
				}
				
			});
		}
	});
	//socket.emit('loginReply',{'Username': reply['Username']});// send response only to this socket
	}
	

	
setInterval(function(){ // Battles
	
},2000);
/* // solution 1 to ResourceUpdate
setInterval(function(){ // resourcesUpdate
			sqlConnection.query('USE users'); // need to remove any contested RCP squares in the select clause
			sqlConnection.query('         SELECT volume, map1.type, Username, GameID, TileID FROM constructs, map1 WHERE TileID NOT IN (SELECT DISTINCT a.Map_ID FROM rcp_resources AS a, rcp_resources AS b WHERE a.Map_ID = b.Map_ID AND a.rcp_id <> b.rcp_id  AND ( SELECT Username FROM constructs WHERE ID = a.rcp_id ) <> ( SELECT Username FROM constructs WHERE ID = b.rcp_id )  AND ( SELECT gameID FROM constructs WHERE id = a.rcp_id ) = (  SELECT gameID FROM constructs WHERE id = b.rcp_id ) AND (SELECT GameID FROM constructs WHERE ID = a.rcp_id) = GameID) AND TileID IN (SELECT DISTINCT Map_ID FROM rcp_resources WHERE RCP_ID = ID) GROUP BY TileID , GameID  ', function(err, results) {
				if (err) {
				console.log('error in select query 1 in resources updates interval');
				//throw err;
				}
				else{
					var res_Type = 1;
					for(var i = 0 ; i < results.length;i++){ 
						res_Type = 1;
						if(results[i].type > 30 && results[i].type <= 40){ // minerals 
							res_Type = 2;
						}else if(results[i].type > 40 && results[i].type <= 42){//red
							res_Type = 3;
						}else if(results[i].type > 42 && results[i].type <= 44){//green
							res_Type = 4;
						}else if(results[i].type > 44 && results[i].type <= 46){//blue
							res_Type = 5;
						}
						console.log('res_type: '+ res_Type + ' ');
						updateResource(results[i].Username,results[i].GameID,res_Type,results[i].volume);
					}
				}
			});
},10000); // every ten seconds
*/

setInterval(function(){ // resourcesUpdate
			//console.log('started');
			sqlConnection.query('USE users'); // need to remove any contested RCP squares in the select clause
			sqlConnection.query('SELECT volume, map1.type, Username, GameID, TileID FROM constructs, map1 WHERE TileID IN (SELECT DISTINCT Map_ID FROM rcp_resources WHERE RCP_ID = ID) order by GameID, TileID  ', function(err, results) {
				if (err) {
				console.log('error in select query 1 in resources updates interval');
				//throw err;
				}//    SELECT volume, map1.type, Username, GameID, TileID FROM constructs, map1 WHERE NOT EXISTS (SELECT DISTINCT a.Map_ID FROM rcp_resources AS a join rcp_resources AS b on a.Map_ID = b.Map_ID WHERE a.rcp_id <> b.rcp_id AND a.Map_ID = TileID  AND ( SELECT Username FROM constructs WHERE ID = a.rcp_id ) <> ( SELECT Username FROM constructs WHERE ID = b.rcp_id )  AND ( SELECT gameID FROM constructs WHERE id = a.rcp_id ) = (  SELECT gameID FROM constructs WHERE id = b.rcp_id ) AND (SELECT GameID FROM constructs WHERE ID = a.rcp_id) = GameID) AND TileID IN (SELECT DISTINCT Map_ID FROM rcp_resources WHERE RCP_ID = ID) GROUP BY TileID , GameID  ', function(err, results) {
				//    SELECT volume, map1.type, Username, GameID, TileID FROM constructs, map1 WHERE NOT EXISTS (SELECT DISTINCT a.Map_ID FROM rcp_resources AS a, rcp_resources AS b WHERE a.Map_ID = b.Map_ID AND a.rcp_id <> b.rcp_id AND a.Map_ID = TileID  AND ( SELECT Username FROM constructs WHERE ID = a.rcp_id ) <> ( SELECT Username FROM constructs WHERE ID = b.rcp_id )  AND ( SELECT gameID FROM constructs WHERE id = a.rcp_id ) = (  SELECT gameID FROM constructs WHERE id = b.rcp_id ) AND (SELECT GameID FROM constructs WHERE ID = a.rcp_id) = GameID) AND TileID IN (SELECT DISTINCT Map_ID FROM rcp_resources WHERE RCP_ID = ID) GROUP BY TileID , GameID  ', function(err, results) {
				
				else{
					var res_Type = 1;
					var unique = true;
					var duplicate = 0; // debug
					//var count = 0; // debug
					var count = 0;
					for(var i = 0 ; i < results.length;i++){ 
						for(var k = i+1; k < results.length; k++){
							if(results[k].TileID === results[i].TileID && k > i &&  results[k].Username === results[i].Username && results[k].GameID === results[i].GameID){ // duplicate
								while(results[k].TileID === results[i].TileID && k > i &&  results[k].Username === results[i].Username && results[k].GameID === results[i].GameID){
									k++;
								}
								k--;
								i = k; // this will skip to the end of the duplicates if they are in a row, which they are because of the order by
								//console.log('here i: '+ i+ ' K: '+k);
							}
							if(results[k].GameID != results[i].GameID){// done because I am onto a new game
								k = results.length;
							}
							else if(results[k].TileID === results[i].TileID && k > i){ // tiles are the same ID and not the same as I
								unique = false;
								//console.log('Somewhere1 i: '+ i+ ' game:'+results[i].GameID+' name: '+results[i].Username+ ' K: '+k +' name: '+results[k].Username+' kgame: '+results[k].GameID);
								k = results.length;
								//console.log('Somewhere2 i: '+ i+ 'game:'+results[i].GameID+' K: '+k +'kgame: '+results[k].GameID);
							}
							
						}
						if(unique === true){
							res_Type = 1;
							if(results[i].type > 30 && results[i].type <= 40){ // minerals 
								res_Type = 2;
							}else if(results[i].type > 40 && results[i].type <= 42){//red
								res_Type = 3;
							}else if(results[i].type > 42 && results[i].type <= 44){//green
								res_Type = 4;
							}else if(results[i].type > 44 && results[i].type <= 46){//blue
								res_Type = 5;
							}
							count++; // debug
							//console.log('res_type: '+ res_Type + ' typeID:' +  results[i].TileID + ' Game: '+  results[i].GameID + ' i: '+ i + ' length: '+results.length + ' count: '+count ); // debug
							updateResource(results[i].Username,results[i].GameID,res_Type,results[i].volume);
						}
						unique = true;
					}
					console.log('count :' + count); //debug
				}
			});
},10000);

function addTile(j,k,construct){
	
	//get the tile with 
	//console.log('called tile X: '+(construct[0].mapX -((1-construct[0].upgrade1)+j))+ ' Y: '+ (construct[0].mapY -((1-construct[0].upgrade1)+k)) );//debug
					
	sqlConnection.query('SELECT * FROM map1 WHERE mapX = '+j+' AND mapY = '+k+' AND type > 20',function(err,result){
		if(err){console.log('error in select in add Tile');}
		
		else{
			if(result.length > 0){// then it is a resource
				sqlConnection.query('INSERT INTO RCP_Resources VALUES ("'+construct[0].ID+'","' +result[0].TileID +'" ) ', function(err, results) {
					if(err){console.log('error in insert in addTile');}
					else{
						console.log('added tile to the database X: '+j+ ' Y: '+ k + ' type:' + result[0].type + ' mapX:'+result[0].mapX+' mapY:'+result[0].mapY );//debug
					}
				});
			}
		}
	});
	
	//this.gridA[(this.constructArray[i].mapX-(1 + this.constructArray[i].ZOI)) + j][(this.constructArray[i].mapY-(1 + this.constructArray[i].ZOI)) + k].checkOwner(this.constructArray[i].owner);// pass the player to the grid position
}
function updateResource(u,g,t,v){
	sqlConnection.query('USE users');
	sqlConnection.query('UPDATE user_resources SET Volume = Volume + '+v+' WHERE Username = "'+u+'" AND GameID = '+g+' AND Type = '+t+' ', function(err, results) {
							if(err){
							console.log('error error in update in resource Update: '+u+' AND GameID = '+g+' AND Type = '+t+' ANd volume:'+v);
							}
							else{
							
							}
						});//resources updated
						
						/*sqlConnection.query('UPDATE user_resources as A SET A.Volume=((SELECT Volume from user_resources as B WHERE B.Username = "'+results[i].Username+'" AND B.GameID = '+results[i].GameID+' AND B.Type = '+res_Type+') + results[i].volume) WHERE A.Username = "'+results[i].Username+'" AND A.GameID = '+results[i].GameID+' AND A.Type = '+res_Type+' ', function(err, results) {
							if(err){
							console.log('error error in update in resource Update: '+results[i].Username+' AND GameID = '+results[i].GameID+' AND Type = '+res_Type);
							}
							else{
							
							}
						});//resources updated*/
}

function fightBattle(obj1,obj2,incity1, incity2){
	var damage = getAttack(obj1.type, obj2.type);
	var att1 = damage[0];
	var att2 = damage[1];
	var bonus1 = 1;
	if(incity1){bonus1 = 1.5;} // bouns for being in the city
	var bonus2 = 1;
	if(incity2){bonus2 = 1.5;}
	// pull the map tiles and work out what the advantage for the tile is.
	var mapBonus1 = 1; // mean nothing at the moment
	var mapBonus2 = 1;
	var bool = false;
	sqlConnection.query('USE Users');
	sqlConnection.query('SELECT type,mapX,mapY FROM map1 WHERE mapX ='+obj1.mapX+' AND mapY='+obj1.mapY+' OR mapX ='+obj2.mapX+' AND mapY='+obj2.mapY+'', function(err, results) {
		if (err) {
		console.log('error in get map in fight battle ');
		//throw err;
		}
		else{
			if(results[0].mapX === obj1.mapX && results[0].mapY === obj1.mapY){
				if(results[0].type < 10){
					mapBonus1 = .8;
				}
				else if(results[0].type < 20){
					mapBonus1 = 1.2;
				}else{ // mineral
					mapBonus1 = 1.5;
				}
				if(results[1].type < 10){
					mapBonus2 = .8;
				}
				else if(results[1].type < 20){
					mapBonus2 = 1.2;
				}else{ // mineral
					mapBonus2 = 2;
				}
			}
			else{
				if(results[0].type < 10){
					mapBonus2 = .8;
				}
				else if(results[0].type < 20){
					mapBonus2 = 1.2;
				}else{ // mineral
					mapBonus2 = 2;
				}
				if(results[1].type < 10){
					mapBonus1 = .8;
				}
				else if(results[1].type < 20){
					mapBonus1 = 1.2;
				}else{ // mineral
					mapBonus1 = 1.5;
				}
			}
			att1 = (((att1 * bonus1) * mapBonus1) * obj1.qty)/6; // get the total attack, say it a total 6 to kill a unit 
			att2 = (((att2 * bonus2) * mapBonus2) * obj2.qty)/6; 
			
			obj1.qty -= att2;
			obj2.qty -= att1;
			
			obj1.qty = Math.floor(obj1.qty);
			obj2.qty = Math.floor(obj2.qty);
			
			console.log('unit 1 qty: ' +  obj1.qty +' unit1 att : '+att1+' ob2: '+obj2.qty +' obj2 att: '+att2);
			if(obj1.qty < 0){ // remove from the database
				sqlConnection.query('DELETE FROM units WHERE ID = '+obj1.ID+' ', function(err, results) {
				if(err){
					console.log('oh shit son');
				}
				else{
					game.emit('removeUnit',{mapX:obj1.mapX,mapY:obj1.mapY,qty:obj1.qty,GameID:obj1.GameID,PlayerID:obj1.Username, ID:obj1.ID});
				}
				});
			}
			else{ //update the database
				sqlConnection.query('UPDATE units SET qty='+obj1.qty+' WHERE id='+obj1.ID+'', function(err, results) {
				if(err){
					console.log('error in update obj1 in fight');
				}
				else{
					game.emit('unitFightData',{mapX:obj1.mapX,mapY:obj1.mapY,qty:obj1.qty,GameID:obj1.GameID,PlayerID:obj1.Username, ID:obj1.ID});
				}
				});
			}
			
			if(obj2.qty < 0){
				sqlConnection.query('DELETE FROM units WHERE ID = '+obj2.ID+' ', function(err, results) {
				if(err){
					console.log('oh shit son');
				}
				else{
					game.emit('removeUnit',{mapX:obj2.mapX,mapY:obj2.mapY,qty:obj2.qty,GameID:obj2.GameID, PlayerID:obj2.Username, ID:obj2.ID});
				}
				});
			}
			else{
				sqlConnection.query('UPDATE units SET qty='+obj2.qty+' WHERE id='+obj2.ID+'', function(err, results) {
				if(err){
					console.log('error in update obj1 in fight');
				}
				else{
					game.emit('unitFightData',{mapX:obj2.mapX,mapY:obj2.mapY,qty:obj2.qty,GameID:obj2.GameID, PlayerID:obj2.Username, ID:obj2.ID});
				}
				});
			}
			//bool = true;
		}
	});
}

function getAttack(type1, type2){
	var attack = [];
	if(type1 < 3){ // tankish
		if(type2 < 3){ // tank
			attack.push(3); // unit one attack againist unit 2
			attack.push(3);// reverse
			return(attack);
		}else if(type2 < 5){ // ground unit
			attack.push(4); // unit one attack againist unit 2
			attack.push(1);// reverse
			return(attack);
		}else{ // plane
			attack.push(0); // unit one attack againist unit 2
			attack.push(3);// reverse
			return(attack);
		}
	}else if(type1 < 5){ // G unit
		if(type2 < 3){
			attack.push(1); // unit one attack againist unit 2
			attack.push(4);// reverse
			return(attack);
		}else if(type2 < 5){ 
			attack.push(4); // unit one attack againist unit 2
			attack.push(4);// reverse
			return(attack);
		}else{
			attack.push(0); // unit one attack againist unit 2
			attack.push(3);// reverse
			return(attack);
		}
	}else{ // plane
		if(type2 < 3){
			attack.push(3); // unit one attack againist unit 2
			attack.push(0);// reverse
			return(attack);
		}else if(type2 < 5){
			attack.push(3); // unit one attack againist unit 2
			attack.push(0);// reverse
			return(attack);
		}else{
			attack.push(4); // unit one attack againist unit 2
			attack.push(4);// reverse
			return(attack);
		}
	}
}

//var gameMap = [];
/*io.sockets.on('connection', function (socket) {
 // socket.emit('news', { hello: 'world' });
  socket.on('chat', function (data) {
    //var info = data.said;
	//console.log(info);
	
  });
});*/

/*var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8080);

function handler (req, res) {
/*
  fs.readFile(__dirname + '/NewWorld.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading New World.html');
    }

    res.writeHead(200);
    res.end(data);
  });
  res.end();
}

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
*/

/*
var express = require('express');
var app = express();

app.get('/', function(req, res){
	//console.log('please fucking work');
	res.send('hello world');
	//res.sendfile(__dirname+ '/style.css');
	//res.sendfile(__dirname+ '/newworld.html');
});

app.listen(8080);
*/
