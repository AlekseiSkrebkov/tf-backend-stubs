const common_tools = require('../common');

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
			firstname: "Alex",
			lastname: "Skrebkov",
			email: "alex.skrebkov@castle.co",
			divisions: [
				{
					id: 1,
					name: "Division 1",
					type: "carrier",
					code: "dvscar1"
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
					name: "Division 7",
					type: "carrier",
					code: "dvscar7"
				},
				{
					id: 9,
					name: "Division 9",
					type: "carrier",
					code: "dvscar9"
				},
				{
					id: 4,
					name: "Division 4",
					type: "broker",
					code: "dvsbro4",
					"permissions": ['showDrivers']
				}
			], 
			securityToken: common_tools.guid()
		},
		{
			id: 2,
			firstname: "Egor",
			lastname: "Gorobetz",
			email: "egor.gorobotz@castle.co",
			divisions: [
				{
					id: 2,
					name: "Division 2",
					type: "carrier",
					code: "dvscar2"
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
					name: "Division 8",
					type: "carrier",
					code: "dvscar8"
				},
				{
					id: 10,
					name: "Division 10",
					type: "carrier",
					code: "dvscar10"
				},
				{
					id: 5,
					name: "Division 5",
					type: "broker",
					code: "dvsbro5",
					"permissions": []
				}
			],
			securityToken: common_tools.guid()
		}
	]
}