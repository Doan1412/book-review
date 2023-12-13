import LoginForm from '@/shared/components/login/LoginForm';
import styles from './login-container.module.scss';

export default function LoginContainer() {
    return (
        <div className={styles['container']}>
            <div className={styles['login-container']}>
                <h5 className={styles['title']}>Login</h5>

                <LoginForm />
            </div>
        </div>
    );
}
