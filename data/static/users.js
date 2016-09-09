const common_tools = require('../../services/common');

module.exports = {
	credentials: [
		{
			id: 1,
			login: "user1",
			password: "password1"
		},
		{
			id: 2,
			login: "user2",
			password: "password2"
		}
	],
	profiles: [
		{
			id: 1,
			firstName: "Alex",
			lastName: "Skrebkov",
			email: "alex.skrebkov@castle.co",
			divisions: [
				{
					id: 1,
					name: "Montgomery Logistics",
					type: "carrier",
					code: "MGYL",
					"permissions": []
				},
				{
					id: 3,
					name: "Division 3",
					type: "broker",
					code: "dvsbro3",
					"permissions": []
				},
				{
					id: 5,
					name: "Division 5",
					type: "broker",
					code: "dvsbro5",
					"permissions": []
				},
				{
					id: 7,
					name: "Syfan Logistics",
					type: "carrier",
					code: "SYFNVQP",
					"permissions": []
				},
				{
					id: 9,
					name: "First Choice OS & D",
					type: "carrier",
					code: "FCTICLM",
					"permissions": []
				},
				{
					id: 4,
					name: "Division 4",
					type: "broker",
					code: "dvsbro4",
					"permissions": ['showDrivers']
				}
			], 
			menu: [
				{
					"name": "Transflo ELD",
					"url": "https://my.geotab.com/transflo/#dashboard"
				},
				{
					"name": "Viewer",
					"url": "https://viewer.transfloexpress.com"
				}
			],
			securityToken: common_tools.guid(),
			isVelocity: true
		},
		{
			id: 2,
			firstName: "Egor",
			lastName: "Gorobetz",
			email: "egor.g@castle.co",
			divisions: [
				{
					id: 2,
					name: "JKC Mobile Test Fleet",
					type: "carrier",
					code: "JKCFM",
					"permissions": []
				},
				{
					id: 4,
					name: "Division 3",
					type: "broker",
					code: "dvsbro3",
					"permissions": []
				},
				{
					id: 6,
					name: "Division 6",
					type: "broker",
					code: "dvsbro6",
					"permissions": ['showDrivers']
				},
				{
					id: 8,
					name: "Foodliner - Owner Operator Miscellaneous Document",
					type: "carrier",
					code: "FOLWMMIS",
					"permissions": []
				},
				{
					id: 10,
					name: "Division 10",
					type: "carrier",
					code: "dvscar10",
					"permissions": []
				},
				{
					id: 5,
					name: "Division 5",
					type: "broker",
					code: "dvsbro5",
					"permissions": []
				}
			], 
			menu: [
				{
					"name": "Transflo ELD",
					"url": "https://my.geotab.com/transflo/#dashboard"
				},
				{
					"name": "Viewer",
					"url": "https://viewer.transfloexpress.com"
				}
			],
			securityToken: common_tools.guid(),
			isVelocity: false
		}
	]
}