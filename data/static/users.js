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
					type: "carrier"
				},
				{
					id: 3,
					name: "Division 3",
					type: "broker"
				},
				{
					id: 5,
					name: "Division 5",
					type: "broker"
				},
				{
					id: 7,
					name: "Division 7",
					type: "carrier"
				},
				{
					id: 9,
					name: "Division 9",
					type: "carrier"
				},
				{
					id: 4,
					name: "Division 3",
					type: "broker"
				}
			]
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
					type: "carrier"
				},
				{
					id: 4,
					name: "Division 3",
					type: "broker"
				},
				{
					id: 6,
					name: "Division 6",
					type: "broker"
				},
				{
					id: 8,
					name: "Division 8",
					type: "carrier"
				},
				{
					id: 10,
					name: "Division 10",
					type: "carrier"
				},
				{
					id: 5,
					name: "Division 5",
					type: "broker"
				}
			]
		}
	]
}