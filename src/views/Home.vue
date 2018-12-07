<template>
	<div class="home admin-panel">
		<div class="container" v-if="$store.state.isClientLoggedIn || $store.state.isAdminLoggedIn">
			<form @submit.prevent="submitComplaint()">
				<div class="form-group">
					<label>What/Who is the subject of your concern? *</label>
					<select name="target" v-model="target">
						<option value="none" style="display: none">Please select</option>
						<option>Facilities</option>
						<option>Instructor</option>
						<option>Portal</option>
						<option>Guidance</option>
						<option>Staff</option>
						<option>Event</option>
						<option>Library</option>
						<option>Registrar</option>
					</select>
				</div>
				<div class="form-group">
					<label>What is this all about? *</label>
					<select v-model="about">
						<option value="none" style="display: none">Please select</option>
						<option>Feedback</option>
						<option>Suggestion</option>
					</select>
				</div>
				<div class="form-group">
					<label>Your Complaint *</label>
					<textarea rows="6" placeholder="Type your concern" v-model="message" name="message"></textarea>
				</div>
				<div class="captcha-container">
                    <vue-recaptcha class="g-recaptcha" sitekey="6Le-pnYUAAAAAGx0hkAt7zH_GX2xF3eGTIM66FOo"></vue-recaptcha>
                </div>
				<div class="buttons-container">
					<button type="submit">Submit</button>
					<button class="reset" type="button" @click="reset()">Reset Form</button>
				</div>
			</form>
		</div>
		<div v-if="$store.state.isAdminLoggedIn == false">
			<div class="container login-container" v-if="$store.state.isClientLoggedIn == false && authState == 1">
				<img src="/logo.png" class="logo">
				<p class="h3">User Login</p>
				<form @submit.prevent="clientLogin()">
					<div class="form-group">
						<input type="text" placeholder="Username (ID Number)" v-model="login.username" autofocus>
					</div>
					<div class="form-group">
						<input type="password" placeholder="Password" v-model="login.password">
					</div>
					<div class="form-group">
						<button type="submit">Login</button>
					</div>
				</form>
			</div>
		</div>
		</div>
	</div>
</template>

<script>
	import db from '../services/firebase'
	import $ from 'jquery'
	import jwt from 'jsonwebtoken'
	import Cookie from 'js-cookie'
	import moment from 'moment'
	import { Base64 } from 'js-base64'
	import VueRecaptcha from 'vue-recaptcha'

	export default{
		components: {
			VueRecaptcha
		},
		data() {
			return{
				// data to submit
				about: 'none',
				target: 'none',
				message: '',
				ip: '',
				name: '',

				// others
				authState: 1,

				// for login
				login: {
					username: '',
					password: ''
				},

				
			}
		},
		methods: {
			clientLogin() {
				let me = this
				me.$store.state.isLoading = true
				db.collection('users')
				.where('idnumber', '==', me.login.username)
				.where('password', '==', me.login.password)
				.where('role', '==', 0)
				.where('approved', '==', true)
				.get().then(res => {
					if(!res.empty) { // if matched

						me.$store.state.isAdminLoggedIn = false
						Cookie.remove('admin-token')

						let encoded = jwt.sign({
							user_id: (me.$store.state.isAdminLoggedIn) ? 'superadmin' : res.docs[0].id,
							idnumber: (me.$store.state.isAdminLoggedIn) ? 'superadmin' : res.docs[0].data().idnumber,
							real_name: (me.$store.state.isAdminLoggedIn) ? 'superadmin' : res.docs[0].data().fullname,
							way: (me.$store.state.isAdminLoggedIn) ? 'superadmin' : res.docs[0].data().way,
						}, process.env.VUE_APP_JWT_SECRET, { expiresIn: '24h' })
						Cookie.set('client-token', encoded)
						me.$store.state.isClientLoggedIn = true

						jwt.verify(Cookie.get('client-token'), process.env.VUE_APP_JWT_SECRET, (err, decoded) => {
		                    me.$store.state.decodedClientToken = decoded
			            })
					}else{
						alert('Invalid credentials or your account has not been approved by the administrator. Please try again.')
						Cookie.remove('client-token')
						me.$store.state.isClientLoggedIn = false
					}
				}).catch(err => {
					console.log('Error: '+err)
				}).then(() => {
					me.$store.state.isLoading = false
				})
			},
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
									email: me.reg.email,
									password: me.reg.password,
									role: 0,
									approved: true,
									created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
									updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
									way: me.reg.way
								}).then(() => {
									alert('Thank you for registering. The admin will approve your account within 24 hours.')
									me.reg.idnumber = ''
									me.reg.fullname = ''
									me.reg.email = ''
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
			submitComplaint() {
				let me = this

                if(grecaptcha.getResponse().length < 1){
                    alert('Please verify that you are a human.')
                    die()
                }

				var errors = []
				// validate
				$.each($('.home').find('select'), function() {
					if($(this).find(':selected').val() == 'none') {
						$(this).addClass('has-errors')
						errors.push(1)
					}
				})
				if(me.message == '') {
					$('textarea[name="message"').addClass('has-errors')
					errors.push(1)
				}

				// do not proceed if has errors
				if(errors.length > 0) {
					alert('Please fill-out all required fields')
					die()
				}

				me.setLoading(true)

				// saving here
				let userID = me.$store.state.decodedClientToken.user_id
				let way = me.$store.state.decodedClientToken.way
				let realName = me.$store.state.decodedClientToken.real_name
				let idnumber = me.$store.state.decodedClientToken.idnumber
				db.collection('complaints').doc().set({
					way: way,
					about: me.about,
					target: me.target,
					message: me.message,
					user_id: userID,
					showToPublic: true,
					real_name: realName,
					created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
					updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
					status: 'Pending',
					idnumber: idnumber
				}).then(() => {
					console.log('Success')
					alert('Thank you for submitting your concern.')
				}).catch(err => {
					console.log('Error: '+err)
				}).then(() => {
					me.setLoading(false)
					me.reset()
				})
			},
			reset() {
				let me = this
				$('body select').removeClass('has-errors')
				$('body textarea').removeClass('has-errors')
				me.way = 'none'
				me.about = 'none'
				me.target = 'none'
				me.message = ''
				me.name = ''
			},
			setLoading(val) {
				this.$store.state.isLoading = val
			},
			adminLogout() {
                let me = this
                me.$store.state.isLoading = true
                Cookie.remove('admin-token')
                me.$store.state.isLoading = false
                me.$store.state.isAdminLoggedIn = false
            }
		},
		mounted() {
			let me = this
			me.$parent.onAdminPanel = false
		}
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