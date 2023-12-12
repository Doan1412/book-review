import styles from './login-form.module.scss';

export default function LoginForm() {
    return (
        <>
            <div className={styles['form-item']}>
                <input
                    className={styles['input-container']}
                    placeholder="Username"
                />

                <p className={styles['error-message']}>Error</p>
            </div>

            <div className={styles['form-item']}>
                <input
                    className={styles['input-container']}
                    placeholder="Password"
                />

                <p className={styles['error-message']}>Error</p>
            </div>

            <div className={styles['actions']}>
                <div className={styles['sign-up']}>Sign up</div>

                <button type="button" className={styles['login-btn']}>
                    Đăng nhập
                </button>
            </div>
        </>
    );
}
