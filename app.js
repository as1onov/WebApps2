let tg = window.Telegram.WebApp;
document.addEventListener('DOMContentLoaded', function () {
	const cart = [];
	const buttons = document.querySelectorAll('.btn');
	const userCard = document.getElementById('usercard');
	const checkout = document.getElementById('checkout');
	const continueOrderBtn = document.getElementById('continue-order');
	const deliveryOptions = document.getElementById('delivery-options');
	const deliveryForm = document.getElementById('delivery-form');

	buttons.forEach(button => {
		button.addEventListener('click', function () {
			const itemName = this.getAttribute('data-name');
			const itemPrice = parseFloat(this.getAttribute('data-price'));
			cart.push({ name: itemName, price: itemPrice });
			updateCart();
		});
	});

	function updateCart() {
		userCard.innerHTML = '';
		let total = 0;
		cart.forEach(item => {
			const itemElement = document.createElement('div');
			itemElement.textContent = `${item.name} - ${item.price.toFixed(2)}₽`;
			userCard.appendChild(itemElement);
			total += item.price;
		});
		const totalElement = document.createElement('div');
		totalElement.textContent = `Опщая сумма: ${total.toFixed(2)}₽`;
		userCard.appendChild(totalElement);

		if (cart.length > 0) {
			checkout.style.display = 'block';
		} else {
			checkout.style.display = 'none';
		}
	}

	continueOrderBtn.addEventListener('click', function () {
		deliveryOptions.style.display = 'block';
	});

	document.getElementById('delivery').addEventListener('click', function () {
		showDeliveryForm('delivery');
	});

	document.getElementById('in-house').addEventListener('click', function () {
		showDeliveryForm('in-house');
	});

	document.getElementById('pickup').addEventListener('click', function () {
		showDeliveryForm('pickup');
	});

	function showDeliveryForm(type) {
		deliveryForm.innerHTML = '';
		let formContent = '';

		if (type === 'delivery') {
			formContent = `
				<h3>Введите адрес доставки</h3>
				<input type="text" id="street" placeholder="Улица"><br>
				<input type="text" id="house" placeholder="Номер дома"><br>
				<input type="text" id="apartment" placeholder="Квартира"><br>
				<input type="text" id="deliveryTime" placeholder="Время доставки"><br>
				<textarea id="comments" placeholder="Комментарии"></textarea><br>
			`;
		} else if (type === 'in-house') {
			formContent = `
				<h3>Заказ в самом здании</h3>
				<input type="text" id="table" placeholder="Номер стола"><br>
				<textarea id="comments" placeholder="Комментарии"></textarea><br>
			`;
		} else if (type === 'pickup') {
			formContent = `
				<h3>Самовывоз</h3>
				<input type="text" id="pickupTime" placeholder="Время самовывоза"><br>
				<textarea id="comments" placeholder="Комментарии"></textarea><br>
			`;
		}

		formContent += `<button id="submitOrder">Отправить заказ</button>`;
		deliveryForm.innerHTML = formContent;
		deliveryForm.style.display = 'block';

		document.getElementById('submitOrder').addEventListener('click', function () {
			const orderDetails = {
				items: cart,
				total: cart.reduce((sum, item) => sum + item.price, 0).toFixed(2),
				deliveryType: type,
				details: {}
			};

			if (type === 'delivery') {
				orderDetails.details = {
					street: document.getElementById('street').value,
					house: document.getElementById('house').value,
					apartment: document.getElementById('apartment').value,
					deliveryTime: document.getElementById('deliveryTime').value,
					comments: document.getElementById('comments').value
				};
			} else if (type === 'in-house') {
				orderDetails.details = {
					table: document.getElementById('table').value,
					comments: document.getElementById('comments').value
				};
			} else if (type === 'pickup') {
				orderDetails.details = {
					pickupTime: document.getElementById('pickupTime').value,
					comments: document.getElementById('comments').value
				};
			}

			// Отправка данных в Telegram чат-бота
			sendOrderToTelegram(orderDetails);
			tg.close();
		});
	}

	function sendOrderToTelegram(orderDetails) {
		const message = `
			Новый заказ:
			Товары: ${orderDetails.items.map(item => item.name).join(', ')}
			Общая сумма: $${orderDetails.total}
			Тип доставки: ${orderDetails.deliveryType}
			Детали: ${JSON.stringify(orderDetails.details, null, 2)}
		`;

		// Используем Telegram Web App API для отправки сообщения
		tg.sendData(JSON.stringify(message));
	}
});
















document.addEventListener('DOMContentLoaded', function () {
    const cart = [];
    const cartIcon = document.createElement('div');
    cartIcon.className = 'cart-icon';
    cartIcon.innerHTML = '🛒<span id="cart-count">0</span>';
    document.body.appendChild(cartIcon);

    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function () {
            const item = this.parentElement;
            const itemName = item.querySelector('p') ? item.querySelector('p').textContent : 'Item';
            const itemPrice = 100; // Замените на реальную цену, если она есть

            cart.push({ name: itemName, price: itemPrice });
            updateCartIcon();
        });
    });

    cartIcon.addEventListener('click', function () {
        if (cart.length > 0) {
            showDeliveryOptions();
        }
    });

    function updateCartIcon() {
        const cartCount = document.getElementById('cart-count');
        cartCount.textContent = cart.length;
    }

    function showDeliveryOptions() {
        const deliveryOptions = `
            <div id="delivery-options">
                <h3>Select Delivery Option</h3>
                <button onclick="selectDelivery('delivery')">Delivery</button>
                <button onclick="selectDelivery('pickup')">Pickup</button>
                <button onclick="selectDelivery('dine_in')">Dine In</button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', deliveryOptions);
    }

    window.selectDelivery = function (option) {
        let deliveryInfo = '';
        if (option === 'delivery') {
            deliveryInfo = prompt('Enter your address:');
        } else if (option === 'dine_in') {
            deliveryInfo = prompt('Enter your dine-in time:');
        } else if (option === 'pickup') {
            deliveryInfo = 'Pickup from our restaurant.';
        }

        sendOrderToServer(option, deliveryInfo);
    }

    function sendOrderToServer(option, deliveryInfo) {
        const orderDetails = cart.map(item => item.name).join(', ');
        const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

        fetch('/send_order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                order_details: orderDetails,
                total_amount: totalAmount,
                delivery_option: option,
                delivery_info: deliveryInfo
            })
        }).then(response => response.json()).then(data => {
            if (data.status === 'success') {
                alert('Order sent successfully!');
                document.getElementById('delivery-options').remove();
                cart.length = 0;
                updateCartIcon();
            }
        }).catch(error => console.error('Error:', error));
    }
});




