//#region //! Default Imports

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { apiCallBegan, apiCallSuccess, apiCallFailed } from "./_actions/api";
import moment from "moment";
import config from "../config.json";

//#endregion

//#region //* Custom Imports

//* Any Custom Imports related to Action Wrappers and Selectors goes here

//#endregion

//#region //* Action Wrappers

export const getPosts = () => (dispatch, getState) => {
	const { list, lastFetched } = getState().entities.posts;

	if (list && list.length >= 0) {
		const diffInMinutes = moment().diff(moment(lastFetched), "minutes");
		if (diffInMinutes < 10) return;
	}

	return dispatch(
		apiCallBegan({
			url: config.posts.urls.get,
			onStart: postsRequested.type,
			onSuccess: postsReceived.type,
			onError: postsRequestFailed.type,
		})
	);
};

//#endregion

//#region //* Selectors

export const selectPosts = (state) => state.entities.posts.list;
export const selectPostsCount = (state) => state.entities.posts.list.length;

export const selectPostsForUserId = (userId) =>
	createSelector(
		(state) => state.entities.posts.list,
		(list) => list.filter((post) => post.userId === userId)
	);
//#endregion

//! *****
//! *****
//! *****

//#region //! State Initialization

const initialState = {
	list: [],
	loading: false,
	lastFetched: null,
};

//#endregion

//* ---
//! NO NEED TO USE THESE THUNKS WHEN YOU GOT AN API MIDDLEWARE
//* ---
//#region //! Async Only Thunks

export const doActionAsync = createAsyncThunk(
	"post/fetchCount",
	async (params) => {
		const response = await customApiCall(params);
		// The response we return becomes the `fulfilled` action payload
		return response.data;
	}
);

const customApiCall = (params) => {
	return new Promise((resolve) =>
		setTimeout(() => resolve({ data: params }), 500)
	);
};

//#endregion

//#region //! Custom Thunks - To Perform Sync & Async Operations

export const doAction = (params) => (dispatch, getState) => {
	const currentValue = getPosts(getState());
	dispatch(postsReceived());
};

//#endregion

//#region //! Slice

const post = createSlice({
	name: "post",

	initialState,

	reducers: {
		postsRequested: (posts, action) => {
			posts.loading = action.payload;
		},
		postsReceived: (posts, action) => {
			posts.list = action.payload;
			posts.loading = false;
			posts.lastFetched = Date.now();
		},
		postsRequestFailed: (posts, action) => {
			posts.loading = false;
		},
	},

	// The `extraReducers` field lets the slice handle actions defined elsewhere,
	// including actions generated by createAsyncThunk or in other slices.
	extraReducers: (builder) => {
		builder
			.addCase(doActionAsync.pending, (posts) => {
				posts.loading = true;
			})
			.addCase(doActionAsync.fulfilled, (posts, action) => {
				posts.loading = false;
				posts.list = action.payload;
			})
			.addCase(doActionAsync.rejected, (posts, action) => {
				posts.loading = false; // Alert post
			});
	},
});

//#endregion

//#region //! Exports

const { postsRequested, postsReceived, postsRequestFailed } = post.actions;
export default post.reducer;

//#endregion
