const sendOTP = async (user) => {
    const var1 = Math.floor(100000 + Math.random() * 900000)
    try {
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'Authkey': '390851AeadQj3Y63f0ca62P1'
            },
            body: JSON.stringify({
                template_id: '63f338a6d6fc051cbe6e8832',
                sender: 'UNETRP',
                short_url: '0',
                mobiles: '91' + user.username,
                var1
            })
        };
        try {
            const response = await fetch('https://control.msg91.com/api/v5/flow/', options);
            let data = await response.json()
            strapi.entityService.update('plugin::users-permissions.user', user.id, {
                data: { otp: var1 },
                populate: ['role'],
            });
            data.message = "OTP sent successfully!";
            return data;
        } catch (err) {
            return err;
        }
    } catch (err) {
        return err;
    }
}

module.exports = {
    sendOTP
}