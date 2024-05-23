
//this is the public app id for instagram.com
INSTAGRAM_APP_ID = "936619743392459"  

const fetchRequest = {
    method: 'GET',
    headers: {"X-IG-App-ID": INSTAGRAM_APP_ID},
};

let username;

//function to get the user personal key
const getUserPK = async (username) => {
    const url = `https://www.instagram.com/api/v1/web/search/topsearch/?context=blended&query=${username}&include_reel=false`;
    const data = await fetch(url, fetchRequest)
        //1st promise
        .then(res => res.json());
    
    //Make sure the user exists and return the user personal key
    if (data && data.users && data.users.length > 0) {
        return data.users[0].user.pk;
    } else {
        return `No user with username "${username}" found.`;
    }
};

const unfollowChecker = async (username) => {
    user_pk = await getUserPK(username);
    return user_pk;
}

//usernames will always be lowercase I think
username = "atharva_ketkar_1";

unfollowChecker(username).then(console.log);
//getUserPK(username).then(console.log);