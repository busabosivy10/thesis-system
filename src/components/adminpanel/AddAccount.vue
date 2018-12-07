<template>
	<div class="my-account">
		<h2>Create Account</h2>
				<p class="h3">Register</p>
				<form @submit.prevent="clientRegister()">
					<div class="form-group">
						<input type="text" placeholder="Your ID Number " v-model="reg.idnumber" name="reg_idnumber" autofocus v-validate="'required'">
						<span class="validation-errors">{{ errors.first('reg_idnumber') }}</span>
					</div>
					<div class="form-group">
						<input type="text" placeholder="Fullname" v-model="reg.fullname" name="reg_fullname" v-validate="'required|alpha_spaces'">
						<span class="validation-errors">{{ errors.first('reg_fullname') }}</span>
					</div>
					<div class="form-group">
						<select name="way" v-validate="'excluded:0'" v-model="reg.way">
							<option value="0" disabled>Client Category</option>
							<option>Student</option>
							<option>Faculty</option>
							<option>Industry</option>
							<option>Supplier</option>
							<option>Regalutary Body</option>
							<option>Alumni</option>
							<option>Non-teaching</option>
							<option>Community</option>
							<option>Admin</option>
						</select>
						<span class="validation-errors">{{ (errors.first('way')) ? 'This field is required' : '' }}</span>
					</div>
					<div class="form-group">
						<input type="password" placeholder="Password" v-model="reg.password" name="reg_password" v-validate="'required|min:8'" ref="reg_password">
						<span class="validation-errors">{{ errors.first('reg_password') }}</span>
					</div>
					<div class="form-group">
						<input type="password" placeholder="Confirm Password" v-model="reg.password2" name="reg_password2" v-validate="'required||confirmed:reg_password'">
						<span class="validation-errors">{{ errors.first('reg_password2') }}</span>
					</div>
					<div class="form-group">
						<button type="submit">Submit</button>
					</div>
				</form>
			</div>
</template>

<script>
	import db from '../../services/firebase'
	import $ from 'jquery'
	import jwt from 'jsonwebtoken'
	import Cookie from 'js-cookie'
	import moment from 'moment'
	import { Base64 } from 'js-base64'

	export default {
		data() {
			return{

				// for registration
				reg: {
					idnumber: '',
					username: '',
					fullname: '',
					password: '',
					password2: '',
					way: 0
				}
			}
		},
		methods: {
clientRegister() {
				let me = this
				// validation here
				me.$validator.validate().then(res => {
					if(!res) { // do not proceed
						die()
					}else{
						// check if data exists
						me.$store.state.isLoading = true
						db.collection('users')
						.where('idnumber', '==', me.reg.idnumber)
						.get().then(res => {
							if(!res.empty) { // if exists
								alert('Sorry. It seems like the ID Number you provided is already registered')
							}else{ // if doesnt exits
								db.collection('users').doc().set({
									idnumber: me.reg.idnumber,
									fullname: me.reg.fullname,
									password: me.reg.password,
									role: 0,
									approved: true,
									created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
									updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
									way: me.reg.way
								}).then(() => {
									alert('Thank you for registering. The user is now registered.')
									me.reg.idnumber = ''
									me.reg.fullname = ''
									me.reg.password = ''
									me.reg.password2 = ''
								}).catch(err => {
									console.log('Error: '+err)
								})
							}
						}).catch(err => { console.log('Error: '+error) })
						.then(() => {
							me.$store.state.isLoading = false
						})

					}
				})
				// end
			},
			
		},
		
	}
		$('body').on('change', 'select', function() {
		$(this).removeClass('has-errors')
	})
	$('body').on('change', 'input', function() {
		$(this).removeClass('has-errors')
	})
	$('body').on('change', 'textarea', function() {
		$(this).removeClass('has-errors')
	})
</script>