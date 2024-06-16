
//this is the public app id for instagram.com
INSTAGRAM_APP_ID = "936619743392459";

const fetchRequest = {
    method: 'GET',
    credentials: 'include',
    headers: {"X-IG-App-ID": INSTAGRAM_APP_ID},
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let username;

const getUserInfo = async (user_pk) => {
    const url = `https://www.instagram.com/api/v1/users/${user_pk}/info/`;
    const data = await fetch(url, fetchRequest)
        .then(res => res.json());
    return data.user;
};

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

const dataHelper = async (type,user_pk,count,max_id = "") => {
    let url = `https://www.instagram.com/api/v1/friendships/${user_pk}/${type}/?count=${count}`;
    if (max_id) {
        url += `&max_id=${max_id}`;
    }
    const data = await fetch(url, fetchRequest)
        .then(res => res.json());

    if (data.next_max_id) {
        rand_sleep = Math.floor(Math.random() * (700) + 800)
        console.log(`Loaded ${data.users.length} ${type}. Sleeping for ${rand_sleep}ms`);
        await sleep(rand_sleep);
        return data.users.concat(
            await dataHelper(type,user_pk,count,data.next_max_id)
        );
    }
    return data.users;
}

const getFollowers = async (user_pk, count = 50,max_id = "") => {
    return dataHelper("followers",user_pk,count,max_id);
};

const getFollowing = async (user_pk, count = 50,max_id = "") => {
    return dataHelper("following",user_pk,count,max_id);
};

//main function
const unfollowChecker = async (username) => {
    user_pk = await getUserPK(username);

    const followers = await getFollowers(user_pk);
    const following = await getFollowing(user_pk);

    const followerSet = new Set(followers.map(follower => follower.pk));
    const notFollowingBack = following.filter(followed => !followerSet.has(followed.pk));
    console.log(`There are ${notFollowingBack.length} users that don't follow you back.`);
    console.log(`Sorting these ${notFollowingBack.length} users by follower count to show the least followed users first. Sleeping between requests to avoid rate limiting.`);

    const notFollowingBackWithInfo = await Promise.all(notFollowingBack.map(async (user) => {
        const userInfo = await getUserInfo(user.pk);
        rand_sleep = Math.floor(Math.random() * (700) + 800)
        await sleep(rand_sleep);
        return { username: user.username, follower_count: userInfo.follower_count };
    }));

    notFollowingBackWithInfo.sort((a, b) => a.follower_count - b.follower_count);

    return { notFollowingBack: notFollowingBackWithInfo.map(user => user.username) };
}

//Change the username to the one you want to check. Make sure you are logged in to instagram.com and go to the console to run the code.
username = "username";

unfollowChecker(username).then(console.log);
//getUserPK(username).then(console.log);