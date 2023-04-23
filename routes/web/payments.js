// Imports
var express = require('express');
var router = express.Router();
const Razorpay = require('razorpay')
const PaymentDetail =  require('../../models/payment-detail')
const { nanoid } = require("nanoid");

// Create an instance of Razorpay
let razorPayInstance = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET
})

router.post('/order', async function(req, res, next) {
	console.log('working');
	try {
		const params = {
			amount: req.body.amount ,
			currency: "INR",
			receipt: nanoid(),
			payment_capture: "1"
		};
		const response = await razorPayInstance.orders.create(params);
		const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
		const paymentDetail = new PaymentDetail({
			orderId: response.id,
			receiptId: response.receipt,
			amount: response.amount,
			currency: response.currency,
			createdAt: response.created_at,
			status: response.status
		});
		await paymentDetail.save();
		res.render('pages/payment/checkout', {
			title: "Confirm Order",
			razorpayKeyId: razorpayKeyId,
			paymentDetail : paymentDetail
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Error creating order');
	}
});


/**
 * Verify Payment
 * 
 */
router.post('/verify', async function(req, res, next) {
	body=req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
	let crypto = require("crypto");
	let expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
							.update(body.toString())
							.digest('hex');

	// Compare the signatures
	if(expectedSignature === req.body.razorpay_signature) {
		// if same, then find the previosuly stored record using orderId,
		// and update paymentId and signature, and set status to paid.
		await PaymentDetail.findOneAndUpdate(
			{ orderId: req.body.razorpay_order_id },
			{
				paymentId: req.body.razorpay_payment_id,
				signature: req.body.razorpay_signature,
				status: "paid"
			},
			{ new: true },
			function(err, doc) {
				// Throw er if failed to save
				if(err){
					throw err
				}
				// Render payment success page, if saved succeffully
				res.render('pages/payment/success', {
					title: "Payment verification successful",
					paymentDetail: doc
				})
			}
		);
	} else {
		res.render('pages/payment/fail', {
			title: "Payment verification failed",
		})
	}
});

module.exports = router;